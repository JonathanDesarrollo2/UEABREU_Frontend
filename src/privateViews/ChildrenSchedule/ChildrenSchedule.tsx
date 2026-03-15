// src/privateViews/ChildrenSchedule/ChildrenSchedule.tsx
import { useEffect, useState } from 'react';
import { getChildrenSchedulesAPI } from '../../apis/schedule';
import AnimatedPage from '../../components/AnimatedPage';
import { FaCalendarAlt, FaUserGraduate, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { ChildrenScheduleResponse } from '../../types/schedule';

export default function ChildrenScheduleView() {
  const [data, setData] = useState<ChildrenScheduleResponse['content']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails('');
      const response = await getChildrenSchedulesAPI();
      if (response.result) {
        setData(response.content);
        setSelectedStudentIndex(0);
      } else {
        setError(response.error?.[0] || 'Error al cargar horarios');
        if (response.error) {
          setErrorDetails(JSON.stringify(response.error));
        }
      }
    } catch (err: any) {
      console.error('Error en fetchData:', err);
      setError(err.message || 'Error de conexión');
      setErrorDetails(err.stack || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedStudent = data[selectedStudentIndex];

  const sortSchedules = (schedules: any[]) => {
    const dayOrder: Record<string, number> = {
      lunes: 1,
      martes: 2,
      miercoles: 3,
      jueves: 4,
      viernes: 5,
    };
    return [...schedules].sort((a, b) => {
      const dayDiff = (dayOrder[a.day] || 6) - (dayOrder[b.day] || 6);
      if (dayDiff !== 0) return dayDiff;
      return a.startBlock - b.startBlock;
    });
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStudentIndex(Number(e.target.value));
  };

  const goToDashboard = () => {
    navigate('/representante');
  };

  if (loading) {
    return (
      <AnimatedPage className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando horarios...</p>
        </div>
      </AnimatedPage>
    );
  }

  if (error) {
    return (
      <AnimatedPage className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
          <p className="text-red-600 mb-2 font-semibold">{error}</p>
          {errorDetails && (
            <pre className="text-xs bg-gray-100 p-2 rounded mb-4 overflow-auto max-h-32 text-left">
              {errorDetails}
            </pre>
          )}
          <div className="flex flex-col space-y-2">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reintentar
            </button>
            <button
              onClick={goToDashboard}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (data.length === 0) {
    return (
      <AnimatedPage className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">No tienes hijos inscritos o no tienen horarios asignados.</p>
          <button
            onClick={goToDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </AnimatedPage>
    );
  }

  const schedules = sortSchedules(selectedStudent?.schedules || []);

  return (
    <AnimatedPage className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <FaCalendarAlt className="mr-3 text-blue-600" />
            Horario de Clases
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Consulta los horarios de tus hijos
          </p>
        </div>

        {data.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar hijo:
            </label>
            <select
              id="student-select"
              value={selectedStudentIndex}
              onChange={handleStudentChange}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {data.map((student, index) => (
                <option key={student.studentId} value={index}>
                  {student.studentName} ({student.grade} {student.section})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedStudent && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaUserGraduate className="text-blue-600 text-xl mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedStudent.studentName}
              </h2>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {selectedStudent.grade} {selectedStudent.section}
              </span>
            </div>

            {schedules.length === 0 ? (
              <p className="text-gray-500">Este estudiante no tiene horarios asignados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Día</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aula</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schedules.map((schedule) => (
                      <tr key={schedule.scheduleId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                          {schedule.day}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.timeRange}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.subject} ({schedule.subjectCode})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.teacher}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.classroom || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            schedule.scheduleType === 'regular' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {schedule.scheduleType === 'regular' ? 'Regular' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}