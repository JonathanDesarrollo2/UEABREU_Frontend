import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaSave, FaUndo, FaSpinner, FaClock } from 'react-icons/fa';
import { getBlockTimesAPI, resetBlockTimesAPI, saveBlockTimesAPI } from '../../../apis/blockTimeConfig';
import type { BlockTimeConfig } from '../../../types/blockTimeConfig';

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

const DAY_OPTIONS = [
  { value: 'lunes', text: 'Lunes' },
  { value: 'martes', text: 'Martes' },
  { value: 'miercoles', text: 'Miércoles' },
  { value: 'jueves', text: 'Jueves' },
  { value: 'viernes', text: 'Viernes' },
];

export default function BlockTimeConfigPanel() {
  const [grade, setGrade] = useState('1ro');
  const [section, setSection] = useState('A');
  const [day, setDay] = useState('lunes');
  const [blocks, setBlocks] = useState<BlockTimeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [grade, section, day]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await getBlockTimesAPI(grade, section, day);
      const sortedBlocks = data.blocks.sort((a, b) => a.blockNumber - b.blockNumber);
      setBlocks(sortedBlocks);
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar configuración');
      setBlocks([...DEFAULT_BLOCKS]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange = (blockNumber: number, field: 'startTime' | 'endTime', value: string) => {
    setBlocks(prev => prev.map(block => 
      block.blockNumber === blockNumber ? { ...block, [field]: value } : block
    ));
    setHasChanges(true);
  };

  const handleActiveToggle = (blockNumber: number) => {
    setBlocks(prev => prev.map(block => 
      block.blockNumber === blockNumber ? { ...block, isActive: !block.isActive } : block
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    for (const block of blocks) {
      if (block.startTime >= block.endTime) {
        toast.error(`Bloque ${block.blockNumber}: la hora de inicio debe ser anterior a la de fin`);
        return;
      }
    }
    setIsSaving(true);
    try {
      const response = await saveBlockTimesAPI(grade, section, day, blocks);
      if (response.result) {
        toast.success(`Configuración para ${DAY_OPTIONS.find(d => d.value === day)?.text} guardada`);
        setHasChanges(false);
        await loadConfig();
      } else {
        toast.error(response.error?.[0] || 'Error al guardar');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(`¿Restablecer los horarios del ${DAY_OPTIONS.find(d => d.value === day)?.text} a valores por defecto?`)) return;
    setIsLoading(true);
    try {
      const response = await resetBlockTimesAPI(grade, section, day);
      if (response.result) {
        toast.success('Configuración restablecida');
        await loadConfig();
      } else {
        toast.error(response.error?.[0] || 'Error al restablecer');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al restablecer');
    } finally {
      setIsLoading(false);
    }
  };

  function calculateDuration(start: string, end: string): number {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
          <FaClock className="mr-3 text-purple-600" />
          Configuración de Horarios por Bloques
        </h2>
        <p className="text-gray-600">Defina los tiempos de inicio y fin para cada bloque, por día, grado y sección</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="font-medium text-gray-700">Grado:</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="px-3 py-2 border rounded-md" disabled={isLoading}>
              {GRADE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="font-medium text-gray-700">Sección:</label>
            <select value={section} onChange={(e) => setSection(e.target.value)} className="px-3 py-2 border rounded-md" disabled={isLoading}>
              {SECTION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="font-medium text-gray-700">Día:</label>
            <select value={day} onChange={(e) => setDay(e.target.value)} className="px-3 py-2 border rounded-md" disabled={isLoading}>
              {DAY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
            </select>
          </div>
          <div className="flex space-x-2 ml-auto">
            <button onClick={handleReset} disabled={isLoading || isSaving} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center">
              <FaUndo className="mr-2" /> Restablecer
            </button>
            <button onClick={handleSave} disabled={!hasChanges || isLoading || isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center">
              {isSaving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />} Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-4xl text-blue-600" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bloque</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora Inicio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora Fin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
              </tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blocks.map((block) => {
                const duration = calculateDuration(block.startTime, block.endTime);
                return (
                  <tr key={block.blockNumber} className={!block.isActive ? 'opacity-50 bg-gray-50' : ''}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Bloque {block.blockNumber}</td>
                    <td className="px-4 py-3"><input type="time" value={block.startTime} onChange={(e) => handleTimeChange(block.blockNumber, 'startTime', e.target.value)} disabled={!block.isActive} className="px-2 py-1 border rounded" step="60" /></td>
                    <td className="px-4 py-3"><input type="time" value={block.endTime} onChange={(e) => handleTimeChange(block.blockNumber, 'endTime', e.target.value)} disabled={!block.isActive} className="px-2 py-1 border rounded" step="60" /></td>
                    <td className="px-4 py-3"><label className="inline-flex items-center cursor-pointer"><input type="checkbox" checked={block.isActive} onChange={() => handleActiveToggle(block.blockNumber)} className="form-checkbox h-4 w-4 text-blue-600" /><span className="ml-2">{block.isActive ? 'Activo' : 'Inactivo'}</span></label></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{duration} minutos</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">📝 Notas</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Configure cada día de forma independiente. Los cambios se guardan por separado.</li>
          <li>• Al desactivar un bloque, no aparecerá en la vista previa del horario.</li>
          <li>• Los mismos grados/secciones pueden tener horarios diferentes según el día.</li>
        </ul>
      </div>
    </div>
  );
}
