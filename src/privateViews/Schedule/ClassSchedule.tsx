import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaChalkboardTeacher, FaBook, FaEye, FaClock, FaFilePdf, FaFileExcel, FaSpinner } from 'react-icons/fa';
import AddScheduleForm from './Components/AddScheduleForm';
import AddSubjectForm from './Components/AddSubjectForm';
import AddTeacherForm from './Components/AddTeacherForm';
import SchedulePreview from './Components/SchedulePreview';
import BlockTimeConfigPanel from './Components/BlockTimeConfigPanel';
import AnimatedPage from '../../components/AnimatedPage';
import { ActionButtons } from '../../components/ActionButtons';
import { getSchedulesAPI } from '../../apis/schedule';
import { exportToPdf, exportToExcel, type ExportColumn } from '../../library/exportHelpers';

type TabType = 'schedule' | 'subject' | 'teacher' | 'preview' | 'blockconfig';

const DAY_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const DAY_LABELS: Record<string, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
};

const SCHEDULE_COLUMNS: ExportColumn[] = [
  { header: 'Día', key: 'day', width: 'auto', formatter: (v) => DAY_LABELS[v] || v || '—' },
  { header: 'Bloque', key: 'startBlock', width: 'auto', formatter: (_v, row) => row.startBlock === row.endBlock ? `${row.startBlock}` : `${row.startBlock}-${row.endBlock}` },
  { header: 'Grado', key: 'grade', width: 'auto' },
  { header: 'Sección', key: 'section', width: 'auto' },
  { header: 'Materia', key: 'subject', width: '*', formatter: (_v, row) => row.subject?.name || 'RECESO' },
  { header: 'Docente', key: 'teacher', width: '*', formatter: (_v, row) => row.teacher?.fullName || '—' },
  { header: 'Aula', key: 'classroom', width: 'auto', formatter: (v) => v || '—' },
];

export default function ClassSchedule({ readOnly = false }: { readOnly?: boolean }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>(readOnly ? 'preview' : 'teacher');
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);
  const [previewParams, setPreviewParams] = useState<{ grade: string; section: string }>({
    grade: '1ro',
    section: 'A'
  });

  const allTabs = [
    { id: 'teacher' as TabType, label: 'Agregar Docente', icon: <FaChalkboardTeacher /> },
    { id: 'subject' as TabType, label: 'Agregar Materia', icon: <FaBook /> },
    { id: 'schedule' as TabType, label: 'Agregar Horario', icon: <FaCalendarAlt /> },
    { id: 'preview' as TabType, label: 'Vista Previa', icon: <FaEye /> },
    { id: 'blockconfig' as TabType, label: 'Configurar Bloques', icon: <FaClock /> },
  ];
  const tabs = readOnly ? allTabs.filter((t) => t.id === 'preview') : allTabs;

  const handleExport = async (kind: 'pdf' | 'excel') => {
    setExporting(kind);
    try {
      const resp = await getSchedulesAPI();
      if (!resp.result || !Array.isArray(resp.content)) throw new Error('No se pudieron cargar los datos para exportar');
      const rows = [...resp.content].sort((a: any, b: any) =>
        String(a.grade).localeCompare(String(b.grade)) ||
        String(a.section).localeCompare(String(b.section)) ||
        DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) ||
        a.startBlock - b.startBlock
      );
      const opts = {
        title: 'Lista de Horarios',
        columns: SCHEDULE_COLUMNS,
        rows,
        filename: 'horarios',
      };
      if (kind === 'pdf') await exportToPdf(opts);
      else await exportToExcel(opts);
      toast.success(`Exportación ${kind.toUpperCase()} generada correctamente`);
    } catch (err: any) {
      toast.error(err?.message || 'Error al exportar');
    } finally {
      setExporting(null);
    }
  };

  const handleCancel = useCallback(() => {
    navigate('/admin/academic');
  }, [navigate]);

  const handleClear = useCallback(() => {
    toast.info('Formulario limpiado');
  }, []);

  const handlePreviewChange = useCallback((grade: string, section: string) => {
    setPreviewParams({ grade, section });
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'teacher':
        return <AddTeacherForm />;
      case 'subject':
        return <AddSubjectForm />;
      case 'schedule':
        return <AddScheduleForm onPreviewChange={handlePreviewChange} />;
      case 'preview':
        return <SchedulePreview grade={previewParams.grade} section={previewParams.section} readOnly={readOnly} />;
      case 'blockconfig':
        return <BlockTimeConfigPanel />;
      default:
        return <AddScheduleForm onPreviewChange={handlePreviewChange} />;
    }
  };

  return (
    <AnimatedPage className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <FaCalendarAlt className="mr-3 text-blue-600" />
            Gestión Académica - Horarios
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {readOnly
              ? 'Visualiza el horario completo por grado y sección y exporta la lista de horarios'
              : 'Administra horarios, materias, docentes, configuración de bloques y visualiza el horario completo por grado y sección'}
          </p>
        </div>

        <div className="flex flex-wrap justify-end items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exporting === 'pdf' ? (<><FaSpinner className="animate-spin" />Generando...</>) : (<><FaFilePdf />PDF</>)}
          </button>
          <button
            type="button"
            onClick={() => handleExport('excel')}
            disabled={!!exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exporting === 'excel' ? (<><FaSpinner className="animate-spin" />Generando...</>) : (<><FaFileExcel />Excel</>)}
          </button>
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    inline-flex items-center px-4 py-3 text-sm font-medium border-b-2
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                    transition-colors duration-200
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {renderTabContent()}
        </div>

        {!readOnly && activeTab !== 'preview' && activeTab !== 'blockconfig' && (
          <div className="mt-6">
            <ActionButtons 
              onCancel={handleCancel} 
              onClear={handleClear}
            />
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}