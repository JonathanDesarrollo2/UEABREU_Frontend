import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaDownload, FaCheck, FaTrash, FaSearch } from "react-icons/fa";
import ConfirmModal from "../../components/ConfirmModal";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

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

  const token = localStorage.getItem("tokcattleraising_inCattleRanchCloud") || "";

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search.trim(),
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
  }, [token, page, limit, search]);

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

      const calcEdad = (fecha: string) => {
        if (!fecha) return '';
        const hoy = new Date();
        const nac = new Date(fecha);
        let edad = hoy.getFullYear() - nac.getFullYear();
        const mes = hoy.getMonth() - nac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
        return edad;
      };

      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [20, 20, 20, 20],
        content: [
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
                      ...appData.students.map((est: any, idx: number) => ({
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
        ],
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8"
    >
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestión de Solicitudes de Inscripción</h2>

      {/* Barra de búsqueda y límite */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o nº de planilla..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : applications.length === 0 ? (
        <p className="text-center text-gray-500">No hay solicitudes registradas.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left">N°</th>
                  <th className="py-2 px-3 text-left">N° Planilla</th>
                  <th className="py-2 px-3 text-left">Representante</th>
                  <th className="py-2 px-3 text-left">Correo</th>
                  <th className="py-2 px-3 text-left">Estado</th>
                  <th className="py-2 px-3 text-left">Fecha</th>
                  <th className="py-2 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, index) => (
                  <tr key={app.id} className="border-t hover:bg-gray-50">
                    {/* Contador secuencial */}
                    <td className="py-2 px-3 font-semibold">
                      {(page - 1) * limit + index + 1}
                    </td>
                    {/* Número de planilla real */}
                    <td className="py-2 px-3">{app.planillaNumber}</td>
                    <td className="py-2 px-3">{app.representativeName}</td>
                    <td className="py-2 px-3">{app.email}</td>
                    <td className="py-2 px-3">
                      {app.userActive ? (
                        <span className="text-green-600 font-semibold">Activo</span>
                      ) : (
                        <span className="text-yellow-600 font-semibold">Pendiente</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleDownload(app.id)}
                          className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          title="Descargar PDF"
                        >
                          <FaDownload />
                        </button>
                        {!app.userActive && (
                          <button
                            onClick={() => handleActivate(app.id)}
                            className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            title="Activar cuenta"
                          >
                            <FaCheck />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          title="Eliminar registro"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {page} de {totalPages} (Total: {totalRecords} solicitudes)
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300"
            >
              Siguiente
            </button>
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
    </motion.div>
  );
};

export default AdminRegistrationsList;