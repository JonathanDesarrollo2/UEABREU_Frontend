import { useEffect, useState } from 'react';
import { getChildrenSchedulesAPI } from '../../apis/schedule';
import AnimatedPage from '../../components/AnimatedPage';
import { FaCalendarAlt, FaUserGraduate, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

interface BlockData {
  blockId: number;
  time: string;
  period: string;
  isBreak?: boolean;
  isOccupied?: boolean;
  subject?: string;
  subjectCode?: string;
  teacher?: string;
  classroom?: string;
  spans?: number;
}

interface StudentScheduleData {
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  schedulesByDay: Record<string, BlockData[]>;
  blockTimesByDay: Record<string, Array<{ blockNumber: number; startTime: string; endTime: string; isActive: boolean }>>;
}

export default function ChildrenScheduleView() {
  const [studentsData, setStudentsData] = useState<StudentScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getChildrenSchedulesAPI();
        if (response.result) {
          setStudentsData(response.content);
          setSelectedStudentIndex(0);
        } else {
          toast.error(response.error?.[0] || 'Error al cargar horarios');
        }
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <AnimatedPage className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando horarios...</p>
        </div>
      </AnimatedPage>
    );
  }

  if (studentsData.length === 0) {
    return (
      <AnimatedPage className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No tienes hijos inscritos en el sistema.</p>
        </div>
      </AnimatedPage>
    );
  }

  const currentStudent = studentsData[selectedStudentIndex];
  const { schedulesByDay, blockTimesByDay, grade, section, studentName } = currentStudent;

  // Obtener el rango de tiempo para un bloque y día específico
  const getBlockTimeString = (day: string, blockNumber: number): string => {
    const blocks = blockTimesByDay[day];
    if (!blocks) return '';
    const block = blocks.find(b => b.blockNumber === blockNumber);
    return block ? `${block.startTime} - ${block.endTime}` : '';
  };

  // Obtener el rango para materias de dos bloques
  const getTwoBlockTimeRange = (day: string, startBlockId: number): string => {
    const blocks = blockTimesByDay[day];
    if (!blocks) return '';
    const startBlock = blocks.find(b => b.blockNumber === startBlockId);
    const endBlock = blocks.find(b => b.blockNumber === startBlockId + 1);
    if (startBlock && endBlock) {
      return `${startBlock.startTime} - ${endBlock.endTime}`;
    }
    return getBlockTimeString(day, startBlockId);
  };

  // Obtener todos los números de bloque únicos que aparecen en algún día
  const allBlockNumbers = Array.from(
    new Set(
      DAYS.flatMap(day => (blockTimesByDay[day] || []).map(b => b.blockNumber))
    )
  ).sort((a, b) => a - b);

  // Verificar si una celda debe ser oculta por span de una materia anterior
  const isBlockSpanned = (day: string, blockNumber: number): boolean => {
    const blocks = schedulesByDay[day];
    if (!blocks) return false;
    for (let i = 1; i < blockNumber; i++) {
      const prevBlock = blocks.find(b => b.blockId === i);
      if (prevBlock?.spans === 2 && i + 1 === blockNumber) {
        return true;
      }
    }
    return false;
  };

  const getCellContent = (day: string, blockNumber: number): BlockData | null => {
    return schedulesByDay[day]?.find(b => b.blockId === blockNumber) || null;
  };

  const getCellClass = (block: BlockData | null): string => {
    if (!block) return 'bg-white';
    if (block.isBreak) return 'bg-yellow-100';
    if (block.isOccupied) return 'bg-red-100';
    if (block.subject && block.subject !== 'RECESO') return 'bg-green-50';
    return 'bg-white';
  };

  return (
    <AnimatedPage className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <FaCalendarAlt className="mr-3 text-blue-600" />
            Horario de Clases
          </h1>
          <p className="text-gray-600">Consulta los horarios de tus hijos según su grado y sección</p>
        </div>

        {studentsData.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar hijo:
            </label>
            <select
              value={selectedStudentIndex}
              onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {studentsData.map((student, idx) => (
                <option key={student.studentId} value={idx}>
                  {student.studentName} ({student.grade} {student.section})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FaUserGraduate className="text-blue-600 text-xl mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">{studentName}</h2>
            <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {grade} - Sección {section}
            </span>
          </div>

          {/* Tabla de horario igual a la de preview */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bloques</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allBlockNumbers.map(blockNumber => (
                  <tr key={blockNumber} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-200 bg-gray-50">
                      <div className="font-medium text-gray-900">Bloque {blockNumber}</div>
                      <div className="text-gray-500 text-xs">{getBlockTimeString('lunes', blockNumber)}</div>
                      <div className="text-gray-400 text-xs">
                        {blockNumber === 5 ? 'Receso' : `${blockNumber}° Horario`}
                      </div>
                    </td>
                    {DAYS.map(day => {
                      const isSpanned = isBlockSpanned(day, blockNumber);
                      if (isSpanned) return null;
                      const cellData = getCellContent(day, blockNumber);
                      const cellClass = getCellClass(cellData);
                      return (
                        <td
                          key={`${day}-${blockNumber}`}
                          className={`px-4 py-3 text-sm border border-gray-200 ${cellClass}`}
                          rowSpan={cellData?.spans === 2 ? 2 : 1}
                        >
                          {cellData?.isBreak ? (
                            <div className="text-center text-yellow-700 font-medium py-2">
                              RECESO
                              <div className="text-xs text-yellow-600 mt-1">{getBlockTimeString(day, blockNumber)}</div>
                            </div>
                          ) : cellData?.subject && cellData.subject !== 'RECESO' ? (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">{cellData.subject}</div>
                              {cellData.subjectCode && <div className="text-xs text-gray-500">({cellData.subjectCode})</div>}
                              {cellData.teacher && <div className="text-xs text-blue-600 font-medium">{cellData.teacher}</div>}
                              {cellData.classroom && <div className="text-xs text-gray-500">Aula: {cellData.classroom}</div>}
                              <div className="text-xs text-gray-400 mt-2">
                                {cellData.spans === 2
                                  ? getTwoBlockTimeRange(day, blockNumber)
                                  : getBlockTimeString(day, blockNumber)}
                              </div>
                            </div>
                          ) : cellData?.isOccupied ? (
                            <div className="text-center text-red-600 font-medium py-2">OCUPADO</div>
                          ) : (
                            <div className="text-center text-gray-400 py-2">
                              Disponible
                              <div className="text-xs text-gray-300 mt-1">{getBlockTimeString(day, blockNumber)}</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen informativo */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Información</h3>
            <p className="text-sm text-gray-600">
              Los horarios mostrados corresponden al grado <strong>{grade}</strong> y sección <strong>{section}</strong> del estudiante.
              Si el estudiante cambia de grado o sección, los horarios se actualizarán automáticamente.
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}