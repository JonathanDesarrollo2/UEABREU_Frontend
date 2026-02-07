import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaChalkboardTeacher, FaBook, FaEye } from 'react-icons/fa';
import AddScheduleForm from './Components/AddScheduleForm';
import AddSubjectForm from './Components/AddSubjectForm'; // <-- CORREGIDO: 'A' mayúscula
import AddTeacherForm from './Components/AddTeacherForm';
import SchedulePreview from './Components/SchedulePreview';
import AnimatedPage from '../../components/AnimatedPage';
import { ActionButtons } from '../../components/ActionButtons';

// Tabs disponibles
type TabType = 'schedule' | 'subject' | 'teacher' | 'preview';

export default function ClassSchedule() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('teacher');
  const [previewParams, setPreviewParams] = useState<{ grade: string; section: string }>({
    grade: '1ro',
    section: 'A'
  });

  const tabs = [
    { id: 'teacher' as TabType, label: 'Agregar Docente', icon: <FaChalkboardTeacher /> },
    { id: 'subject' as TabType, label: 'Agregar Materia', icon: <FaBook /> },
    { id: 'schedule' as TabType, label: 'Agregar Horario', icon: <FaCalendarAlt /> },
    { id: 'preview' as TabType, label: 'Vista Previa', icon: <FaEye /> },
  ];

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
        return <SchedulePreview grade={previewParams.grade} section={previewParams.section} />;
      default:
        return <AddScheduleForm onPreviewChange={handlePreviewChange} />;
    }
  };

  return (
    <AnimatedPage className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <FaCalendarAlt className="mr-3 text-blue-600" />
            Gestión Académica - Horarios
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Administra horarios, materias, docentes y visualiza el horario completo por grado y sección
          </p>
        </div>

        {/* Tabs Navigation */}
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

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {renderTabContent()}
        </div>

        {/* Action Buttons */}
        {activeTab !== 'preview' && (
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