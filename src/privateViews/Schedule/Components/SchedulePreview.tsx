import { useState, useEffect } from 'react';
import { FaSync, FaPrint, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getSchedulesByGradeSectionAPI } from '../../../apis/schedule';

const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const BLOCK_TIMES = [
  { id: 1, time: '7:00 - 7:40', period: 'Primer Horario' },
  { id: 2, time: '7:40 - 8:20', period: 'Segundo Horario' },
  { id: 3, time: '8:20 - 9:00', period: 'Tercer Horario' },
  { id: 4, time: '9:00 - 9:40', period: 'Cuarto Horario' },
  { id: 5, time: '10:00 - 10:20', period: 'Receso' },
  { id: 6, time: '10:20 - 10:40', period: 'Sexto Horario' },
  { id: 7, time: '10:40 - 11:20', period: 'Séptimo Horario' },
  { id: 8, time: '11:20 - 12:00', period: 'Octavo Horario' },
  { id: 9, time: '12:20 - 12:40', period: 'Noveno Horario' }
];

const GRADE_OPTIONS = [
  { value: '1ro', text: 'Primer Año' },
  { value: '2do', text: 'Segundo Año' },
  { value: '3ro', text: 'Tercer Año' },
  { value: '4to', text: 'Cuarto Año' },
  { value: '5to', text: 'Quinto Año' },
  { value: '6to', text: 'Sexto Año' },
];

const SECTION_OPTIONS = [
  { value: 'A', text: 'Sección A' },
  { value: 'B', text: 'Sección B' },
  { value: 'C', text: 'Sección C' },
  { value: 'D', text: 'Sección D' },
  { value: 'E', text: 'Sección E' },
];

interface SchedulePreviewProps {
  grade?: string;
  section?: string;
}

export default function SchedulePreview({ grade: initialGrade = '1ro', section: initialSection = 'A' }: SchedulePreviewProps) {
  const [grade, setGrade] = useState(initialGrade);
  const [section, setSection] = useState(initialSection);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: string; blockId: number } | null>(null);

  const loadSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await getSchedulesByGradeSectionAPI(grade, section);
      if (response.result) {
        setScheduleData(response.content);
      } else {
        toast.error('Error al cargar el horario');
      }
    } catch (error) {
      toast.error('Error al cargar el horario');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [grade, section]);

  const handleSearch = () => {
    loadSchedule();
  };

  const handlePrint = () => {
    window.print();
  };

  const getCellContent = (day: string, blockId: number) => {
    if (!scheduleData?.schedulesByDay?.[day]) return null;
    
    const block = scheduleData.schedulesByDay[day].find((b: any) => b.blockId === blockId);
    if (!block) return null;

    return block;
  };

  const getCellClass = (block: any) => {
    if (block.isBreak) return 'bg-yellow-100';
    if (block.isOccupied) return 'bg-red-100';
    if (block.subject) return 'bg-green-50 hover:bg-green-100';
    return 'bg-white hover:bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800">Vista Previa del Horario</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {grade} - Sección {section}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Selectores de Grado y Sección */}
            <div className="flex items-center space-x-2">
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GRADE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.text}</option>
                ))}
              </select>

              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SECTION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.text}</option>
                ))}
              </select>

              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <FaSearch className="mr-2" />
                Buscar
              </button>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-2">
              <button
                onClick={loadSchedule}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center"
              >
                <FaSync className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Cargando...' : 'Actualizar'}
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <FaPrint className="mr-2" />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 border border-green-300 mr-2"></div>
          <span className="text-sm">Materia asignada</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 border border-red-300 mr-2"></div>
          <span className="text-sm">Bloque ocupado</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 mr-2"></div>
          <span className="text-sm">Receso</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border border-gray-300 mr-2"></div>
          <span className="text-sm">Disponible</span>
        </div>
      </div>

      {/* Tabla del horario */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bloques
              </th>
              {DAYS.map(day => (
                <th key={day} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {BLOCK_TIMES.map(blockTime => (
              <tr key={blockTime.id} className="hover:bg-gray-50">
                {/* Celda de bloque/hora */}
                <td className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-200">
                  <div className="font-medium text-gray-900">Bloque {blockTime.id}</div>
                  <div className="text-gray-500 text-xs">{blockTime.time}</div>
                  <div className="text-gray-400 text-xs">{blockTime.period}</div>
                </td>

                {/* Celdas por día */}
                {DAYS.map(day => {
                  const cellData = getCellContent(day, blockTime.id);
                  const isSelected = selectedCell?.day === day && selectedCell?.blockId === blockTime.id;
                  
                  return (
                    <td
                      key={`${day}-${blockTime.id}`}
                      className={`px-4 py-3 text-sm border border-gray-200 ${getCellClass(cellData)} 
                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                        ${cellData?.spans === 2 ? 'align-top' : ''}`}
                      onClick={() => setSelectedCell({ day, blockId: blockTime.id })}
                      rowSpan={cellData?.spans === 2 ? 2 : 1}
                    >
                      {cellData?.subject ? (
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{cellData.subject}</div>
                          {cellData.subjectCode && (
                            <div className="text-xs text-gray-500">({cellData.subjectCode})</div>
                          )}
                          {cellData.teacher && (
                            <div className="text-xs text-blue-600 font-medium">{cellData.teacher}</div>
                          )}
                          {cellData.classroom && (
                            <div className="text-xs text-gray-500">Aula: {cellData.classroom}</div>
                          )}
                        </div>
                      ) : cellData?.isBreak ? (
                        <div className="text-center text-yellow-700 font-medium">RECESO</div>
                      ) : cellData?.isOccupied ? (
                        <div className="text-center text-red-600 font-medium">OCUPADO</div>
                      ) : (
                        <div className="text-center text-gray-400">Disponible</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detalles de la celda seleccionada */}
      {selectedCell && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Información del Bloque</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Día:</span>
              <span className="ml-2 font-medium capitalize">{selectedCell.day}</span>
            </div>
            <div>
              <span className="text-gray-600">Bloque:</span>
              <span className="ml-2 font-medium">{selectedCell.blockId}</span>
            </div>
            <div>
              <span className="text-gray-600">Hora:</span>
              <span className="ml-2 font-medium">
                {BLOCK_TIMES.find(b => b.id === selectedCell.blockId)?.time}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Estado:</span>
              <span className="ml-2 font-medium">
                {getCellContent(selectedCell.day, selectedCell.blockId)?.subject ? 'Ocupado' : 'Disponible'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Información general */}
      {scheduleData && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Resumen del Horario</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(scheduleData.schedulesByDay || {}).flat().filter((b: any) => b.subject).length}
              </div>
              <div className="text-gray-600">Materias asignadas</div>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-2xl font-bold text-green-600">
                {new Set(Object.values(scheduleData.schedulesByDay || {}).flat().filter((b: any) => b.teacher).map((b: any) => b.teacher)).size}
              </div>
              <div className="text-gray-600">Docentes asignados</div>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-2xl font-bold text-gray-600">
                {Object.values(scheduleData.schedulesByDay || {}).flat().filter((b: any) => !b.subject && !b.isBreak).length}
              </div>
              <div className="text-gray-600">Bloques disponibles</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}