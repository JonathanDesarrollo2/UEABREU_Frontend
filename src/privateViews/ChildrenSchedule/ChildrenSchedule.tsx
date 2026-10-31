import { useEffect, useState } from 'react';
import { getChildrenSchedulesAPI } from '../../apis/schedule';
import AnimatedPage from '../../components/AnimatedPage';
import { FaCalendarAlt, FaUserGraduate, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const DAY_ABBR: Record<string, string> = {
  lunes: 'Lun',
  martes: 'Mar',
  miercoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie'
};

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
      <AnimatedPage className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center max-w-sm w-full">
          <p className="text-gray-600">No tienes hijos inscritos en el sistema.</p>
        </div>
      </AnimatedPage>
    );
  }

  const currentStudent = studentsData[selectedStudentIndex];
  const { schedulesByDay, blockTimesByDay, grade, section, studentName } = currentStudent;

  const fallbackBlocks = blockTimesByDay['lunes'] || [];
  const getDayBlocks = (day: string) => {
    const blocks = blockTimesByDay[day];
    if (blocks && blocks.length > 0) return blocks;
    return fallbackBlocks;
  };

  const getBlockTimeString = (day: string, blockNumber: number): string => {
    const blocks = getDayBlocks(day);
    const block = blocks.find(b => b.blockNumber === blockNumber);
    if (!block) return '';
    return `${block.startTime} - ${block.endTime}`;
  };

  const getTwoBlockTimeRange = (day: string, startBlockId: number): string => {
    const blocks = getDayBlocks(day);
    const startBlock = blocks.find(b => b.blockNumber === startBlockId);
    const endBlock = blocks.find(b => b.blockNumber === startBlockId + 1);
    if (startBlock && endBlock) {
      return `${startBlock.startTime} - ${endBlock.endTime}`;
    }
    return getBlockTimeString(day, startBlockId);
  };

  const allBlockNumbers = Array.from(
    new Set([
      ...fallbackBlocks.map(b => b.blockNumber),
      ...DAYS.flatMap(day => [
        ...getDayBlocks(day).map(b => b.blockNumber),
        ...(schedulesByDay[day] || []).flatMap(b =>
          Array.from({ length: b.spans || 1 }, (_, index) => b.blockId + index)
        ),
      ]),
    ])
  ).sort((a, b) => a - b);

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
    const blocks = schedulesByDay[day] || [];
    const existing = blocks.find(b => b.blockId === blockNumber);
    if (existing) return existing;

    if (blockNumber === 5) {
      return {
        blockId: 5,
        time: '5-5',
        period: 'Receso',
        isBreak: true,
        subject: 'RECESO',
        spans: 1,
      };
    }
    return null;
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 flex items-center justify-center">
            <FaCalendarAlt className="mr-2 sm:mr-3 text-blue-600" />
            Horario de Clases
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Consulta los horarios de tus hijos</p>
        </div>

        {studentsData.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Seleccionar hijo:
            </label>
            <select
              value={selectedStudentIndex}
              onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}
              className="w-full md:w-64 px-3 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {studentsData.map((student, idx) => (
                <option key={student.studentId} value={idx}>
                  {student.studentName} ({student.grade} {student.section})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2">
            <div className="flex items-center">
              <FaUserGraduate className="text-blue-600 text-lg sm:text-xl mr-2" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate pr-2">{studentName}</h2>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm w-fit">
              {grade} - Sección {section}
            </span>
          </div>

          {/* Tabla de horario con scroll horizontal */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-16 sm:w-auto px-1 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-100 z-10 border-r border-gray-200">
                    Bloq
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="w-24 sm:w-auto px-1 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                      <span className="hidden sm:inline">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                      <span className="sm:hidden">{DAY_ABBR[day]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allBlockNumbers.map(blockNumber => (
                  <tr key={blockNumber} className="hover:bg-gray-50">
                    <td className="px-1 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-sm border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                      <div className="font-medium text-gray-900">B-{blockNumber}</div>
                      <div className="text-gray-500 text-[9px] sm:text-xs truncate">{getBlockTimeString('lunes', blockNumber)}</div>
                      <div className="text-gray-400 text-[8px] sm:text-[10px]">
                        {blockNumber === 5 ? 'Receso' : `${blockNumber}°`}
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
                          className={`px-1 sm:px-4 py-1 sm:py-3 text-xs sm:text-sm border border-gray-200 ${cellClass}`}
                          rowSpan={cellData?.spans === 2 ? 2 : 1}
                        >
                          {cellData?.isBreak ? (
                            <div className="text-center text-yellow-700 font-medium py-1 sm:py-2">
                              RECESO
                              <div className="text-[9px] sm:text-xs text-yellow-600 mt-0.5">{getBlockTimeString(day, blockNumber)}</div>
                            </div>
                          ) : cellData?.subject && cellData.subject !== 'RECESO' ? (
                            <div className="space-y-0.5">
                              <div className="font-medium text-gray-900 leading-tight text-[11px] sm:text-sm">{cellData.subject}</div>
                              {cellData.subjectCode && <div className="text-[9px] sm:text-xs text-gray-500">({cellData.subjectCode})</div>}
                              {cellData.teacher && <div className="text-[10px] sm:text-xs text-blue-600 font-medium truncate">{cellData.teacher}</div>}
                              {cellData.classroom && <div className="text-[9px] sm:text-xs text-gray-500 truncate">Aula: {cellData.classroom}</div>}
                              <div className="text-[8px] sm:text-xs text-gray-400 mt-1">
                                {cellData.spans === 2
                                  ? getTwoBlockTimeRange(day, blockNumber)
                                  : getBlockTimeString(day, blockNumber)}
                              </div>
                            </div>
                          ) : cellData?.isOccupied ? (
                            <div className="text-center text-red-600 font-medium py-1 sm:py-2 text-[10px] sm:text-sm">OCUPADO</div>
                          ) : (
                            <div className="text-center text-gray-400 py-1 sm:py-2 text-[10px] sm:text-sm">
                              Libre
                              <div className="text-[8px] sm:text-xs text-gray-300 mt-0.5">{getBlockTimeString(day, blockNumber)}</div>
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
          <div className="mt-4 sm:mt-6 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Información</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Los horarios mostrados corresponden al grado <strong>{grade}</strong> y sección <strong>{section}</strong>. 
              Si el estudiante cambia de grado o sección, se actualizarán automáticamente.
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}