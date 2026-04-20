import { useState, useEffect } from 'react';
import { getSchedulesByGradeSectionAPI, deleteScheduleAPI } from '../../../apis/schedule';
import { getBlockTimesAPI } from '../../../apis/blockTimeConfig';
import type { BlockTimeConfig } from '../../../types/blockTimeConfig';
import { FaSync, FaPrint, FaSearch, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

// Valores por defecto en caso de fallo de la API
const DEFAULT_BLOCKS: BlockTimeConfig[] = [
  { blockNumber: 1, startTime: '07:00', endTime: '07:40', isActive: true },
  { blockNumber: 2, startTime: '07:40', endTime: '08:20', isActive: true },
  { blockNumber: 3, startTime: '08:20', endTime: '09:00', isActive: true },
  { blockNumber: 4, startTime: '09:00', endTime: '09:40', isActive: true },
  { blockNumber: 5, startTime: '09:40', endTime: '10:00', isActive: true },
  { blockNumber: 6, startTime: '10:00', endTime: '10:40', isActive: true },
  { blockNumber: 7, startTime: '10:40', endTime: '11:20', isActive: true },
  { blockNumber: 8, startTime: '11:20', endTime: '12:00', isActive: true },
  { blockNumber: 9, startTime: '12:20', endTime: '12:40', isActive: true },
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

interface BlockData {
  blockId: number;
  time: string;
  period: string;
  isBreak?: boolean;
  isOccupied?: boolean;
  occupiedBy?: string;
  subject?: string;
  subjectCode?: string;
  teacher?: string;
  classroom?: string;
  scheduleId?: string;
  spans?: number;
}

export default function SchedulePreview({ grade: initialGrade = '1ro', section: initialSection = 'A' }: SchedulePreviewProps) {
  const [grade, setGrade] = useState(initialGrade);
  const [section, setSection] = useState(initialSection);
  const [scheduleData, setScheduleData] = useState<any>({ schedulesByDay: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: string; blockId: number } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<{ 
    id?: string; 
    code?: string; 
    subject?: string; 
    day: string; 
    blockId: number;
    isBreak?: boolean;
  } | null>(null);

  // Estado para los tiempos de bloques desde la BD
  const [blockTimes, setBlockTimes] = useState<BlockTimeConfig[]>([]);
  const [loadingBlockTimes, setLoadingBlockTimes] = useState(false);

  // Cargar horarios
  const loadSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await getSchedulesByGradeSectionAPI(grade, section);
      if (response.result && response.content) {
        setScheduleData(response.content);
      } else {
        setScheduleData({ schedulesByDay: {} });
      }
    } catch (error) {
      console.error('Error al cargar el horario:', error);
      toast.error('Error al cargar el horario');
      setScheduleData({ schedulesByDay: {} });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar configuración de tiempos de bloques desde la BD
  const loadBlockTimes = async () => {
    setLoadingBlockTimes(true);
    try {
      const data = await getBlockTimesAPI(grade, section);
      // Filtrar solo bloques activos y ordenar
      const activeBlocks = data.blocks
        .filter(b => b.isActive)
        .sort((a, b) => a.blockNumber - b.blockNumber);
      setBlockTimes(activeBlocks);
    } catch (error) {
      console.error('Error cargando configuración de bloques:', error);
      toast.error('Usando configuración de horarios por defecto');
      setBlockTimes(DEFAULT_BLOCKS.filter(b => b.isActive));
    } finally {
      setLoadingBlockTimes(false);
    }
  };

  // Efecto inicial y al cambiar grado/sección
  useEffect(() => {
    loadSchedule();
    loadBlockTimes();
  }, [grade, section]);

  const handleSearch = () => {
    loadSchedule();
    loadBlockTimes();
  };

  const handlePrint = () => {
    window.print();
  };

  // Obtener el string de tiempo para un bloque (desde blockTimes)
  const getBlockTimeString = (blockNumber: number): string => {
    const block = blockTimes.find(b => b.blockNumber === blockNumber);
    return block ? `${block.startTime} - ${block.endTime}` : '';
  };

  // Obtener el nombre del período (genérico)
  const getPeriodName = (blockNumber: number): string => {
    const periodNames: Record<number, string> = {
      1: 'Primer Horario',
      2: 'Segundo Horario',
      3: 'Tercer Horario',
      4: 'Cuarto Horario',
      5: 'Receso',
      6: 'Sexto Horario',
      7: 'Séptimo Horario',
      8: 'Octavo Horario',
      9: 'Noveno Horario',
    };
    return periodNames[blockNumber] || `Bloque ${blockNumber}`;
  };

  const getCellContent = (day: string, blockId: number): BlockData | null => {
    // Primero revisamos si hay datos reales del backend
    if (!scheduleData?.schedulesByDay?.[day]) {
      // Si es el bloque 5 (receso por defecto) y no hay datos, devolver bloque de receso
      if (blockId === 5) {
        return {
          blockId,
          time: getBlockTimeString(blockId),
          period: getPeriodName(blockId),
          isBreak: true,
          subject: 'RECESO',
          scheduleId: undefined,
        };
      }
      return null;
    }
    
    const block = scheduleData.schedulesByDay[day].find((b: any) => b.blockId === blockId);
    
    // Si no se encuentra el bloque pero es el bloque 5 (receso por defecto)
    if (!block && blockId === 5) {
      return {
        blockId,
        time: getBlockTimeString(blockId),
        period: getPeriodName(blockId),
        isBreak: true,
        subject: 'RECESO',
        scheduleId: undefined,
      };
    }
    
    if (block) {
      return {
        ...block,
        time: getBlockTimeString(blockId),
        period: getPeriodName(blockId),
        scheduleId: block.scheduleId,
      };
    }
    
    return null;
  };

  const getCellClass = (block: BlockData | null) => {
    if (!block) return 'bg-white hover:bg-gray-50';
    if (block.isBreak) return 'bg-yellow-100';
    if (block.isOccupied) return 'bg-red-100';
    if (block.subject && block.subject !== 'RECESO') return 'bg-green-50 hover:bg-green-100 cursor-pointer';
    return 'bg-white hover:bg-gray-50';
  };

  const isBlockSpanned = (day: string, blockId: number): boolean => {
    if (!scheduleData?.schedulesByDay?.[day]) return false;
    
    for (let i = 1; i < blockId; i++) {
      const previousBlock = getCellContent(day, i);
      if (previousBlock?.spans === 2 && i + 1 === blockId) {
        return true;
      }
    }
    return false;
  };

  const getTwoBlockTimeRange = (startBlockId: number): string => {
    const startBlock = blockTimes.find(b => b.blockNumber === startBlockId);
    const endBlock = blockTimes.find(b => b.blockNumber === startBlockId + 1);
    if (startBlock && endBlock) {
      return `${startBlock.startTime} - ${endBlock.endTime}`;
    }
    return getBlockTimeString(startBlockId);
  };

  const handleCellClick = (day: string, blockId: number) => {
    const cellData = getCellContent(day, blockId);
    
    if (cellData?.scheduleId) {
      setScheduleToDelete({
        id: cellData.scheduleId,
        code: cellData.subjectCode,
        subject: cellData.subject,
        day,
        blockId,
        isBreak: cellData.isBreak || false,
      });
      setShowDeleteModal(true);
    } else {
      setSelectedCell({ day, blockId });
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setScheduleToDelete(null);
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete?.id) return;
    
    setIsLoading(true);
    try {
      const response = await deleteScheduleAPI(scheduleToDelete.id);
      
      if (response.result) {
        toast.success('Horario eliminado exitosamente');
        await loadSchedule();
        closeDeleteModal();
      } else {
        toast.error(response.error?.[0] || 'Error al eliminar horario');
      }
    } catch (error: any) {
      console.error('Error al eliminar horario:', error);
      toast.error(error.message || 'Error al eliminar horario');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingBlockTimes || blockTimes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSync className="animate-spin text-3xl text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando configuración de horarios...</span>
      </div>
    );
  }

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
            <div className="flex items-center space-x-2">
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {GRADE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.text}</option>
                ))}
              </select>

              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
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
                {isLoading ? 'Cargando...' : 'Buscar'}
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => { loadSchedule(); loadBlockTimes(); }}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center"
              >
                <FaSync className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
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
            {blockTimes.map(blockTime => (
              <tr key={blockTime.blockNumber} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-200 bg-gray-50">
                  <div className="font-medium text-gray-900">Bloque {blockTime.blockNumber}</div>
                  <div className="text-gray-500 text-xs">{getBlockTimeString(blockTime.blockNumber)}</div>
                  <div className="text-gray-400 text-xs">{getPeriodName(blockTime.blockNumber)}</div>
                </td>

                {DAYS.map(day => {
                  const isSpanned = isBlockSpanned(day, blockTime.blockNumber);
                  
                  if (isSpanned) {
                    return null;
                  }
                  
                  const cellData = getCellContent(day, blockTime.blockNumber);
                  const isSelected = selectedCell?.day === day && selectedCell?.blockId === blockTime.blockNumber;
                  const cellClass = getCellClass(cellData);
                  
                  return (
                    <td
                      key={`${day}-${blockTime.blockNumber}`}
                      className={`px-4 py-3 text-sm border border-gray-200 ${cellClass} 
                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                        ${cellData?.spans === 2 ? 'align-top' : ''}`}
                      onClick={() => handleCellClick(day, blockTime.blockNumber)}
                      rowSpan={cellData?.spans === 2 ? 2 : 1}
                    >
                      {cellData?.isBreak ? (
                        <div className="text-center text-yellow-700 font-medium py-2 relative group">
                          {cellData.scheduleId && (
                            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setScheduleToDelete({
                                    id: cellData.scheduleId,
                                    code: cellData.subjectCode,
                                    subject: cellData.subject,
                                    day,
                                    blockId: blockTime.blockNumber,
                                    isBreak: true,
                                  });
                                  setShowDeleteModal(true);
                                }} 
                              />
                            </div>
                          )}
                          RECESO
                          <div className="text-xs text-yellow-600 mt-1">{getBlockTimeString(blockTime.blockNumber)}</div>
                        </div>
                      ) : cellData?.subject && cellData.subject !== 'RECESO' ? (
                        <div className="space-y-1 group relative">
                          {cellData.scheduleId && (
                            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setScheduleToDelete({
                                    id: cellData.scheduleId,
                                    code: cellData.subjectCode,
                                    subject: cellData.subject,
                                    day,
                                    blockId: blockTime.blockNumber,
                                    isBreak: false,
                                  });
                                  setShowDeleteModal(true);
                                }} 
                              />
                            </div>
                          )}
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
                          <div className="text-xs text-gray-400 mt-2">
                            {cellData.spans === 2 
                              ? getTwoBlockTimeRange(blockTime.blockNumber)
                              : getBlockTimeString(blockTime.blockNumber)}
                          </div>
                        </div>
                      ) : cellData?.isOccupied ? (
                        <div className="text-center text-red-600 font-medium py-2">
                          OCUPADO
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-2">
                          Disponible
                          <div className="text-xs text-gray-300 mt-1">{getBlockTimeString(blockTime.blockNumber)}</div>
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
                {getBlockTimeString(selectedCell.blockId)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Estado:</span>
              <span className="ml-2 font-medium">
                {(() => {
                  const cell = getCellContent(selectedCell.day, selectedCell.blockId);
                  if (cell?.isBreak) return 'Receso';
                  if (cell?.subject && cell.subject !== 'RECESO') return 'Ocupado por materia';
                  if (cell?.isOccupied) return 'Ocupado';
                  return 'Disponible';
                })()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Información general */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Resumen del Horario</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(scheduleData.schedulesByDay || {}).flat()
                .filter((b: any) => b?.subject && b.subject !== 'RECESO').length}
            </div>
            <div className="text-gray-600">Materias asignadas</div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-green-600">
              {(() => {
                const teachers = new Set();
                Object.values(scheduleData.schedulesByDay || {}).flat()
                  .filter((b: any) => b?.teacher)
                  .forEach((b: any) => teachers.add(b.teacher));
                return teachers.size;
              })()}
            </div>
            <div className="text-gray-600">Docentes asignados</div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-gray-600">
              {Object.values(scheduleData.schedulesByDay || {}).flat()
                .filter((b: any) => !b?.subject && !b?.isBreak && !b?.isOccupied).length}
            </div>
            <div className="text-gray-600">Bloques disponibles</div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Grado: <span className="font-medium">{grade}</span> | Sección: <span className="font-medium">{section}</span></p>
          <p className="mt-1">Total de bloques activos: {blockTimes.length}</p>
        </div>
      </div>

      {/* Modal de confirmación para borrar */}
      {showDeleteModal && scheduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" 
            onClick={closeDeleteModal}
          ></div>
          
          <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Eliminar {scheduleToDelete.isBreak ? 'receso' : 'materia'}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">¿Estás seguro de continuar?</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Detalles:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">{scheduleToDelete.isBreak ? 'Tipo:' : 'Materia:'}</span>
                      <p className="font-medium text-gray-900">
                        {scheduleToDelete.isBreak ? 'RECESO' : scheduleToDelete.subject}
                      </p>
                    </div>
                    {!scheduleToDelete.isBreak && scheduleToDelete.code && (
                      <div>
                        <span className="text-gray-500">Código:</span>
                        <p className="font-medium text-blue-600">{scheduleToDelete.code}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Día:</span>
                      <p className="font-medium text-gray-900 capitalize">{scheduleToDelete.day}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Horario:</span>
                      <p className="font-medium text-gray-900">
                        {scheduleToDelete.isBreak 
                          ? getBlockTimeString(scheduleToDelete.blockId)
                          : getTwoBlockTimeRange(scheduleToDelete.blockId)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-red-700">
                    <FaExclamationTriangle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-medium">
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-gray-100">
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteSchedule}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}