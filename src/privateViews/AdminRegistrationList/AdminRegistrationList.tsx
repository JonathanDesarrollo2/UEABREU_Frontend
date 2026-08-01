import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaDownload,
  FaCheck,
  FaTrash,
  FaSearch,
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
  FaFilePdf,
  FaFileExcel,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import ConfirmModal from "../../components/ConfirmModal";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import ExcelJS from 'exceljs';

(pdfMake as any).vfs = pdfFonts.vfs;

const API_BASE = import.meta.env.VITE_API_URL || "https://appservices.ueabreu.com";

interface Application {
  id: string;
  planillaNumber: number;
  email: string;
  representativeName: string;
  userActive: boolean;
  createdAt: string;
}

// Helper para construir la lista de páginas con ellipsis
const buildPageNumbers = (current: number, total: number): (number | "...")[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];
  pages.push(1);

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);
  return pages;
};

// Función que construye el contenido de una planilla individual (para PDF)
const buildSinglePlanillaContent = (appData: any) => {
  const calcEdad = (fecha: string) => {
    if (!fecha) return '';
    const hoy = new Date();
    const nac = new Date(fecha);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  return [
    { text: 'PLANILLA DE SOLICITUD DE INSCRIPCIÓN', style: 'title' },
    { text: 'U.E. José Antonio Abreu - Naguanagua', style: 'subtitle' },
    { text: `N° de Planilla: ${appData.planillaNumber}    |    Fecha: ${new Date().toLocaleDateString()}`, style: 'date' },
    { text: '\n' },
    {
      layout: 'noBorders',
      table: {
        widths: ['*', '*'],
        body: [
          [
            {
              stack: [
                { text: '1. DATOS DEL REPRESENTANTE', style: 'sectionHeader' },
                { text: `Nombre y Apellido: ${appData.representativeFullName}` },
                { text: `Cédula de Identidad: ${appData.representativeIdentityCard}` },
                { text: `Dirección: ${appData.representativeAddress}` },
                { text: `Teléfono: ${appData.representativePhone}` },
                { text: `Relación con el estudiante: ${appData.relationship}` },
                { text: `Nombre del Padre/Madre: ${appData.parentName || '-'}` },
                { text: `Cédula Padre/Madre: ${appData.parentIdentityCard || '-'}` },
                { text: `Teléfono Padre/Madre: ${appData.parentPhone || '-'}` },
              ],
              margin: [0, 0, 5, 0],
            },
            {
              stack: [
                { text: '2. DATOS DE LOS SOLICITANTES', style: 'sectionHeader' },
                ...(appData.students || []).map((est: any, idx: number) => ({
                  stack: [
                    { text: `Solicitante ${idx + 1}`, style: 'studentTitle' },
                    { text: `Nombre: ${est.fullName}` },
                    { text: `Edad: ${calcEdad(est.birthDate)}` },
                    { text: `Fecha Nac.: ${est.birthDate}` },
                    { text: `Nacionalidad: ${est.nationality}` },
                    { text: `País Nac.: ${est.birthCountry}` },
                    { text: `Estado: ${est.state}` },
                    { text: `Zona donde vive: ${est.zone}` },
                    { text: `Municipio: ${est.municipality || '-'}` },
                    { text: `Escuela de procedencia: ${est.previousSchool || '-'}` },
                    { text: `Año que aspira: ${est.aspiredGrade}` },
                    { text: `Dirección: ${est.addressDescription}` },
                    { text: `Teléfono: ${est.phone || '-'}` },
                    { text: `Emergencia: ${est.emergencyContact}` },
                    { text: `Tel. Emerg.: ${est.emergencyPhone}` },
                    { text: `Alergias: ${est.hasAllergies ? est.allergiesDescription : 'No'}` },
                    { text: `Enfermedades: ${est.hasDiseases ? est.diseasesDescription : 'No'}` },
                  ],
                  margin: [0, 0, 0, 8],
                })),
              ],
            },
          ],
        ],
      },
    },
    { text: '\n' },
    { text: 'Para uso del representante:', style: 'bold' },
    {
      layout: 'noBorders',
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [
            '_________________\nFirma del Representante',
            '_________________\nFirma de quien recibe',
            '_________________\nSello',
            'Fecha y hora: ________\n(Uso interno)',
          ],
        ],
      },
    },
    { text: '\n' },
    {
      text: 'Nota: Esta planilla es solo una solicitud de preinscripción, no asegura ni garantiza un cupo definitivo. La aprobación está sujeta a disponibilidad y evaluación de la U.E. José Antonio Abreu.',
      style: 'note',
    },
  ];
};

const AdminRegistrationsList: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<"activate" | "delete" | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const token = localStorage.getItem("tokcattleraising_inCattleRanchCloud") || "";

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search.trim(),
        sortOrder: sortOrder,
      });
      const res = await fetch(`${API_BASE}/api/private/registrations/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.result) {
        setApplications(data.content);
        setTotalPages(data.pagination.totalPages);
        setTotalRecords(data.pagination.totalRecords);
      } else {
        toast.error(data.error?.[0] || "Error al cargar solicitudes");
      }
    } catch (error) {
      toast.error("Error de conexión al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, sortOrder]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDownload = async (id: string) => {
    console.log(`⬇️ [handleDownload] Generando PDF para solicitud ${id}`);
    try {
      const res = await fetch(`${API_BASE}/api/private/registrations/${id}/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error?.[0] || "Error al obtener datos de la solicitud");
        return;
      }
      const json = await res.json();
      if (!json.result) {
        toast.error(json.error?.[0] || "Error al obtener datos");
        return;
      }
      const appData = json.content;

      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [20, 20, 20, 20],
        content: buildSinglePlanillaContent(appData),
        styles: {
          title: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 5, 0, 0] },
          subtitle: { fontSize: 10, alignment: 'center', margin: [0, 0, 0, 5] },
          date: { fontSize: 9, alignment: 'center', margin: [0, 0, 0, 10] },
          sectionHeader: { fontSize: 11, bold: true, decoration: 'underline', margin: [0, 0, 0, 4] },
          studentTitle: { fontSize: 10, bold: true, margin: [0, 4, 0, 2] },
          note: { fontSize: 8, alignment: 'center', color: 'red', margin: [0, 10, 0, 0] },
          bold: { bold: true, fontSize: 9 },
        },
        defaultStyle: { fontSize: 8, lineHeight: 1.15 },
      };

      pdfMake.createPdf(docDefinition).download(`Planilla_${appData.planillaNumber}.pdf`);
    } catch (error) {
      toast.error("Error al generar el PDF.");
    }
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '99999',
        search: search.trim(),
        sortOrder: sortOrder,
      });
      const listRes = await fetch(`${API_BASE}/api/private/registrations/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const listData = await listRes.json();
      if (!listData.result) {
        toast.error(listData.error?.[0] || "Error al obtener la lista de solicitudes");
        setExporting(false);
        return;
      }

      const allApps: Application[] = listData.content;
      if (allApps.length === 0) {
        toast.error("No hay solicitudes para exportar con los filtros actuales.");
        setExporting(false);
        return;
      }

      const pdfContent: any[] = [];

      for (let i = 0; i < allApps.length; i++) {
        const app = allApps[i];
        const dataRes = await fetch(`${API_BASE}/api/private/registrations/${app.id}/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataJson = await dataRes.json();
        if (!dataJson.result) {
          console.warn(`No se pudieron obtener datos de la planilla ${app.planillaNumber}`);
          continue;
        }

        const appData = dataJson.content;

        if (i > 0) {
          pdfContent.push({ text: '', pageBreak: 'before' });
        }

        pdfContent.push(...buildSinglePlanillaContent(appData));
      }

      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [20, 20, 20, 20],
        content: pdfContent,
        styles: {
          title: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 5, 0, 0] },
          subtitle: { fontSize: 10, alignment: 'center', margin: [0, 0, 0, 5] },
          date: { fontSize: 9, alignment: 'center', margin: [0, 0, 0, 10] },
          sectionHeader: { fontSize: 11, bold: true, decoration: 'underline', margin: [0, 0, 0, 4] },
          studentTitle: { fontSize: 10, bold: true, margin: [0, 4, 0, 2] },
          note: { fontSize: 8, alignment: 'center', color: 'red', margin: [0, 10, 0, 0] },
          bold: { bold: true, fontSize: 9 },
        },
        defaultStyle: { fontSize: 8, lineHeight: 1.15 },
      };

      pdfMake.createPdf(docDefinition).download('Planillas_Solicitudes.pdf');
      toast.success(`PDF generado con ${allApps.length} solicitudes.`);
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar las solicitudes.");
    } finally {
      setExporting(false);
    }
  };

  // 🔽 FUNCIÓN DE EXPORTACIÓN A EXCEL – INFORMACIÓN COMPLETA + CONTADOR
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '99999',
        search: search.trim(),
        sortOrder: sortOrder,
      });
      const listRes = await fetch(`${API_BASE}/api/private/registrations/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const listData = await listRes.json();
      if (!listData.result) {
        toast.error(listData.error?.[0] || "Error al obtener la lista de solicitudes");
        setExporting(false);
        return;
      }

      const allApps: Application[] = listData.content;
      if (allApps.length === 0) {
        toast.error("No hay solicitudes para exportar con los filtros actuales.");
        setExporting(false);
        return;
      }

      // Crear libro Excel
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Datos Completos');

      // Definir columnas – se añade el contador "N°" al inicio
      sheet.columns = [
        { header: 'N°', key: 'counter', width: 5 },
        { header: 'N° Planilla', key: 'planillaNumber', width: 12 },
        { header: 'Nombre Representante', key: 'repFullName', width: 25 },
        { header: 'Cédula Representante', key: 'repIdentityCard', width: 15 },
        { header: 'Dirección Representante', key: 'repAddress', width: 25 },
        { header: 'Teléfono Representante', key: 'repPhone', width: 15 },
        { header: 'Relación', key: 'relationship', width: 15 },
        { header: 'Nombre Padre/Madre', key: 'parentName', width: 25 },
        { header: 'Cédula Padre/Madre', key: 'parentIdentityCard', width: 15 },
        { header: 'Teléfono Padre/Madre', key: 'parentPhone', width: 15 },
        { header: 'Nombre Estudiante', key: 'studentFullName', width: 25 },
        { header: 'Edad', key: 'age', width: 6 },
        { header: 'Fecha Nac.', key: 'birthDate', width: 12 },
        { header: 'Nacionalidad', key: 'nationality', width: 15 },
        { header: 'País Nac.', key: 'birthCountry', width: 15 },
        { header: 'Estado', key: 'state', width: 15 },
        { header: 'Zona', key: 'zone', width: 15 },
        { header: 'Municipio', key: 'municipality', width: 15 },
        { header: 'Escuela Procedencia', key: 'previousSchool', width: 20 },
        { header: 'Año Aspira', key: 'aspiredGrade', width: 10 },
        { header: 'Dirección Estudiante', key: 'studentAddress', width: 25 },
        { header: 'Teléfono Estudiante', key: 'studentPhone', width: 15 },
        { header: 'Contacto Emergencia', key: 'emergencyContact', width: 20 },
        { header: 'Tel. Emergencia', key: 'emergencyPhone', width: 15 },
        { header: 'Alergias', key: 'allergies', width: 20 },
        { header: 'Enfermedades', key: 'diseases', width: 20 },
      ];

      // Estilo de encabezado
      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
      });

      let counter = 0;

      // Llenar filas
      for (let i = 0; i < allApps.length; i++) {
        const app = allApps[i];
        const dataRes = await fetch(`${API_BASE}/api/private/registrations/${app.id}/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataJson = await dataRes.json();
        if (!dataJson.result) continue;
        const appData = dataJson.content;

        // Si no hay estudiantes, agregar una fila solo con los datos del representante
        if (!appData.students || appData.students.length === 0) {
          counter++;
          sheet.addRow({
            counter,
            planillaNumber: app.planillaNumber,
            repFullName: appData.representativeFullName,
            repIdentityCard: appData.representativeIdentityCard,
            repAddress: appData.representativeAddress,
            repPhone: appData.representativePhone,
            relationship: appData.relationship,
            parentName: appData.parentName || '',
            parentIdentityCard: appData.parentIdentityCard || '',
            parentPhone: appData.parentPhone || '',
            studentFullName: '',
            age: '',
            birthDate: '',
            nationality: '',
            birthCountry: '',
            state: '',
            zone: '',
            municipality: '',
            previousSchool: '',
            aspiredGrade: '',
            studentAddress: '',
            studentPhone: '',
            emergencyContact: '',
            emergencyPhone: '',
            allergies: '',
            diseases: '',
          });
          continue;
        }

        // Una fila por cada estudiante, repitiendo los datos del representante
        for (const est of appData.students) {
          counter++;
          const edad = est.birthDate ? (() => {
            const hoy = new Date();
            const nac = new Date(est.birthDate);
            let e = hoy.getFullYear() - nac.getFullYear();
            const mes = hoy.getMonth() - nac.getMonth();
            if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) e--;
            return e;
          })() : '';

          sheet.addRow({
            counter,
            planillaNumber: app.planillaNumber,
            repFullName: appData.representativeFullName,
            repIdentityCard: appData.representativeIdentityCard,
            repAddress: appData.representativeAddress,
            repPhone: appData.representativePhone,
            relationship: appData.relationship,
            parentName: appData.parentName || '',
            parentIdentityCard: appData.parentIdentityCard || '',
            parentPhone: appData.parentPhone || '',
            studentFullName: est.fullName,
            age: edad,
            birthDate: est.birthDate,
            nationality: est.nationality,
            birthCountry: est.birthCountry,
            state: est.state,
            zone: est.zone,
            municipality: est.municipality || '',
            previousSchool: est.previousSchool || '',
            aspiredGrade: est.aspiredGrade,
            studentAddress: est.addressDescription,
            studentPhone: est.phone || '',
            emergencyContact: est.emergencyContact,
            emergencyPhone: est.emergencyPhone,
            allergies: est.hasAllergies ? est.allergiesDescription : 'No',
            diseases: est.hasDiseases ? est.diseasesDescription : 'No',
          });
        }
      }

      // Generar archivo y descargar
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Solicitudes_Completas.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Excel generado con ${allApps.length} solicitudes.`);
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar a Excel.");
    } finally {
      setExporting(false);
    }
  };

  const handleActivate = (id: string) => {
    setSelectedId(id);
    setAction("activate");
    setShowConfirm(true);
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setAction("delete");
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    if (!selectedId || !action) return;
    try {
      const url =
        action === "activate"
          ? `${API_BASE}/api/private/registrations/${selectedId}/activate`
          : `${API_BASE}/api/private/registrations/${selectedId}`;
      const method = action === "activate" ? "POST" : "DELETE";
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.result) {
        toast.success(data.content[0]);
        fetchApplications();
      } else {
        toast.error(data.error?.[0] || "Error al ejecutar acción");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setShowConfirm(false);
      setSelectedId(null);
      setAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirm(false);
    setSelectedId(null);
    setAction(null);
  };

  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
            Gestión de Solicitudes
          </h2>
          <div className="text-sm text-gray-500">
            Total: {totalRecords} solicitudes
          </div>
        </div>

        {/* Barra de búsqueda, límite, orden y botones de exportar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o nº de planilla..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
            />
          </div>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow-sm"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>

          <button
            onClick={() => {
              setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              setPage(1);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            title={sortOrder === 'asc' ? 'Orden ascendente (más antiguos primero)' : 'Orden descendente (más recientes primero)'}
          >
            {sortOrder === 'asc' ? <FaSortAmountDown className="text-lg" /> : <FaSortAmountUp className="text-lg" />}
            {sortOrder === 'asc' ? 'Más antiguos' : 'Más recientes'}
          </button>

          <button
            onClick={handleExportAll}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-base font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
          >
            <FaFilePdf className="text-lg" />
            {exporting ? "Exportando..." : "Exportar PDF"}
          </button>

          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-5 py-3 text-base font-semibold text-white shadow-md transition-all hover:from-green-700 hover:to-green-800 disabled:opacity-50"
          >
            <FaFileExcel className="text-lg" />
            {exporting ? "Exportando..." : "Exportar Excel"}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-lg">
            No hay solicitudes registradas.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-base">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-lg font-semibold">
                    <th className="py-4 px-5 text-left">N°</th>
                    <th className="py-4 px-5 text-left">Planilla</th>
                    <th className="py-4 px-5 text-left">Representante</th>
                    <th className="py-4 px-5 text-left">Correo</th>
                    <th className="py-4 px-5 text-left">Estado</th>
                    <th className="py-4 px-5 text-left">Fecha</th>
                    <th className="py-4 px-5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {applications.map((app, index) => (
                    <tr key={app.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                      <td className="py-4 px-5 font-semibold text-gray-700">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="py-4 px-5 font-mono text-blue-700 font-medium">
                        {app.planillaNumber}
                      </td>
                      <td className="py-4 px-5 font-medium text-gray-800">
                        {app.representativeName}
                      </td>
                      <td className="py-4 px-5 text-gray-600">
                        {app.email}
                      </td>
                      <td className="py-4 px-5">
                        {app.userActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-gray-600 text-base">
                        {new Date(app.createdAt).toLocaleDateString('es-VE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleDownload(app.id)}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Descargar PDF"
                          >
                            <FaDownload className="text-lg" />
                          </button>
                          {!app.userActive && (
                            <button
                              onClick={() => handleActivate(app.id)}
                              className="p-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                              title="Activar cuenta"
                            >
                              <FaCheck className="text-lg" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Eliminar registro"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación avanzada */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <div className="text-sm text-gray-500">
                Mostrando {((page - 1) * limit) + 1} – {Math.min(page * limit, totalRecords)} de {totalRecords} resultados
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Primera página"
                >
                  <FaAngleDoubleLeft className="text-lg" />
                </button>

                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                  title="Página anterior"
                >
                  <FaAngleLeft className="text-lg" />
                </button>

                {pageNumbers.map((num, idx) =>
                  num === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500 select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      key={num}
                      onClick={() => setPage(num as number)}
                      className={`min-w-[2.5rem] px-3 py-2 rounded-lg font-medium transition-colors ${
                        page === num
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                  title="Página siguiente"
                >
                  <FaAngleRight className="text-lg" />
                </button>

                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-2 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Última página"
                >
                  <FaAngleDoubleRight className="text-lg" />
                </button>
              </div>
            </div>
          </>
        )}

        <ConfirmModal
          show={showConfirm}
          onClose={cancelAction}
          onConfirm={confirmAction}
          title={action === "activate" ? "Activar Cuenta" : "Eliminar Registro"}
          message={
            action === "activate"
              ? "¿Estás seguro de que deseas activar esta cuenta? El representante podrá iniciar sesión."
              : "¿Estás seguro de que deseas eliminar completamente este registro? Se borrarán el usuario, representante, estudiantes y la planilla. Esta acción no se puede deshacer."
          }
        />
      </div>
    </motion.div>
  );
};

export default AdminRegistrationsList;