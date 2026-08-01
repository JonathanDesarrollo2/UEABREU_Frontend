// src/components/Academic/Components/AddScheduleForm.tsx
import { useEffect, useState } from 'react';
import { useAddSchedule } from '../hooks/useAddSchedule';
import { useScheduleForm, type ScheduleFormValues } from '../hooks/useScheduleForm';
import { toast } from 'react-toastify';
import {
  getActiveTeachersAPI,
  getSchedulesByGradeSectionAPI,
  getSubjectsAPI,
  getSchedulesAPI,
} from '../../../apis/schedule';
import type { TypeScheduleCreate } from '../../../types/schedule';
import type { TypeApiResponseGeneric } from '../../../types/schedule';

// Opciones para los select
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

const BLOCK_OPTIONS = [
  { value: '1', text: 'Bloque 1 (7:00 - 7:40)' },
  { value: '2', text: 'Bloque 2 (7:40 - 8:20)' },
  { value: '3', text: 'Bloque 3 (8:20 - 9:00)' },
  { value: '4', text: 'Bloque 4 (9:00 - 9:40)' },
  { value: '5', text: 'Bloque 5 (10:00 - 10:40)' },
  { value: '6', text: 'Bloque 6 (10:40 - 11:20)' },
  { value: '7', text: 'Bloque 7 (11:20 - 12:00)' },
  { value: '8', text: 'Bloque 8 (12:00 - 12:40)' },
];

interface AddScheduleFormProps {
  onPreviewChange?: (grade: string, section: string) => void;
}

// Función para generar un código único de 7 caracteres que comienza con 'R'
const generateRecessCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const combined = (timestamp + random).replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const padded = combined.padEnd(6, '0');
  return `R${padded}`;
};

export default function AddScheduleForm({ onPreviewChange }: AddScheduleFormProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useScheduleForm();
  const { mutate, isPending } = useAddSchedule();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [existingSchedules, setExistingSchedules] = useState<any[]>([]);
  const [occupiedBlocks, setOccupiedBlocks] = useState<Set<string>>(new Set());
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [isRecess, setIsRecess] = useState(false);
  const [recessCode, setRecessCode] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [showExistingLoader, setShowExistingLoader] = useState(false);
  const [selectedExistingId, setSelectedExistingId] = useState('');
  const [loadingExistingSchedules, setLoadingExistingSchedules] = useState(false);

  const grade = watch('grade');
  const section = watch('section');
  const day = watch('day');
  const startBlock = watch('startBlock');
  const subjectId = watch('subjectId');

  // Cargar materias
  useEffect(() => {
    setLoadingSubjects(true);
    getSubjectsAPI()
      .then(response => {
        if (response.result && response.content) {
          setSubjects(response.content);
        } else {
          setSubjects([]);
        }
      })
      .catch(() => toast.error('Error al cargar materias'))
      .finally(() => setLoadingSubjects(false));
  }, []);

  // Cargar docentes activos
  useEffect(() => {
    setLoadingTeachers(true);
    getActiveTeachersAPI()
      .then(response => {
        if (response.result && response.content) {
          setTeachers(response.content);
        } else {
          setTeachers([]);
        }
      })
      .catch(() => toast.error('Error al cargar docentes'))
      .finally(() => setLoadingTeachers(false));
  }, []);

  // Cargar todos los horarios existentes (para la función "Cargar horario existente")
  useEffect(() => {
    if (showExistingLoader) {
      setLoadingExistingSchedules(true);
      getSchedulesAPI()
        .then(response => {
          if (response.result && response.content) {
            setExistingSchedules(response.content);
          } else {
            setExistingSchedules([]);
          }
        })
        .catch(() => toast.error('Error al cargar horarios existentes'))
        .finally(() => setLoadingExistingSchedules(false));
    }
  }, [showExistingLoader]);

  // Cargar bloques ocupados para vista previa
  useEffect(() => {
    if (grade && section && day) {
      getSchedulesByGradeSectionAPI(grade, section)
        .then(response => {
          if (response.result && response.content?.schedulesByDay?.[day]) {
            const occupied = new Set<string>();
            response.content.schedulesByDay[day].forEach((block: any) => {
              if (block.isOccupied || block.subject) {
                occupied.add(block.blockId.toString());
                if (block.spans === 2) {
                  occupied.add((block.blockId + 1).toString());
                }
              }
            });
            setOccupiedBlocks(occupied);
          }
        })
        .catch(() => {});
    }
  }, [grade, section, day]);

  // Notificar cambios para vista previa
  useEffect(() => {
    if (onPreviewChange && grade && section) {
      onPreviewChange(grade, section);
    }
  }, [grade, section, onPreviewChange]);

  // Si se selecciona una materia, autocompletar docente (si tiene asignado)
  useEffect(() => {
    if (subjectId) {
      const selectedSubject = subjects.find(s => s.id === subjectId);
      if (selectedSubject?.teacherId) {
        setValue('teacherId', selectedSubject.teacherId);
      }
    }
  }, [subjectId, subjects, setValue]);

  // Manejar cambio del checkbox "Receso"
  const handleRecessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsRecess(checked);
    setRetryCount(0);
    if (checked) {
      const newCode = generateRecessCode();
      setRecessCode(newCode);
      setValue('code', newCode);
      setValue('subjectId', '');
      setValue('teacherId', '');
      setValue('classroom', '');
      setValue('building', '');
      // Al marcar receso, desactivar la carga de horario existente
      setShowExistingLoader(false);
      setSelectedExistingId('');
    } else {
      setRecessCode('');
      setValue('code', '');
    }
  };

  // Manejar cambio del checkbox "Cargar horario existente"
  const handleToggleExistingLoader = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowExistingLoader(checked);
    if (!checked) {
      setSelectedExistingId('');
      // Limpiar campos si se desmarca
      setValue('code', '');
      setValue('subjectId', '');
      setValue('teacherId', '');
      setValue('classroom', '');
      setValue('building', '');
    }
    // No se puede receso y carga existente a la vez
    if (checked && isRecess) {
      setIsRecess(false);
    }
  };

  // Cuando se selecciona un horario existente, cargar sus datos
  const handleSelectExistingSchedule = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scheduleId = e.target.value;
    setSelectedExistingId(scheduleId);
    if (!scheduleId) return;

    const selectedSchedule = existingSchedules.find(s => s.id === scheduleId);
    if (!selectedSchedule) return;

    // Rellenar todos los campos excepto día y bloque (que quedan vacíos para que el usuario elija)
    setValue('code', selectedSchedule.code);
    setValue('grade', selectedSchedule.grade);
    setValue('section', selectedSchedule.section);
    // Limpiar día y bloque para que el usuario los establezca
    setValue('day', undefined as any);
    setValue('startBlock', '');
    setValue('subjectId', selectedSchedule.subjectId || '');
    setValue('teacherId', selectedSchedule.teacherId || '');
    setValue('classroom', selectedSchedule.classroom || '');
    setValue('building', selectedSchedule.building || '');

    // Si el horario cargado es un receso, marcar el flag y generar código automático
    if (!selectedSchedule.subjectId) {
      setIsRecess(true);
      setRecessCode(selectedSchedule.code);
    } else {
      setIsRecess(false);
    }
  };

  const onSubmit = (formData: ScheduleFormValues) => {
    const startBlockNum = parseInt(formData.startBlock);
    const endBlockNum = isRecess ? startBlockNum : startBlockNum + 1;

    // Validación de bloques ocupados
    if (isRecess) {
      if (occupiedBlocks.has(startBlockNum.toString())) {
        toast.error('Este bloque ya está ocupado para este día');
        return;
      }
    } else {
      if (
        occupiedBlocks.has(startBlockNum.toString()) ||
        occupiedBlocks.has((startBlockNum + 1).toString())
      ) {
        toast.error('Uno de los bloques ya está ocupado para este día');
        return;
      }
    }

    if (!isRecess && !formData.subjectId) {
      toast.error('Debe seleccionar una materia o marcar como receso');
      return;
    }

    let finalCode = isRecess ? recessCode : formData.code;
    if (!finalCode) {
      toast.error('El código del horario es requerido');
      return;
    }

    if (!/^[A-Z0-9]{7}$/.test(finalCode)) {
      toast.error('El código debe tener 7 caracteres alfanuméricos mayúsculas');
      return;
    }

    const payload: TypeScheduleCreate = {
      code: finalCode,
      grade: formData.grade,
      section: formData.section,
      day: formData.day,
      startBlock: startBlockNum,
      endBlock: endBlockNum,
      classroom: isRecess ? undefined : (formData.classroom || undefined),
      building: isRecess ? undefined : (formData.building || undefined),
      subjectId: isRecess ? null : (formData.subjectId || null),
      teacherId: isRecess ? undefined : (formData.teacherId || undefined),
    };

    mutate(payload, {
      onSuccess: (response: TypeApiResponseGeneric) => {
        if (response.result) {
          toast.success('Horario creado exitosamente');
          reset();
          setIsRecess(false);
          setRecessCode('');
          setRetryCount(0);
          setShowExistingLoader(false);
          setSelectedExistingId('');
          // Actualizar bloques ocupados localmente
          const newOccupied = new Set(occupiedBlocks);
          if (isRecess) {
            newOccupied.add(startBlockNum.toString());
          } else {
            newOccupied.add(startBlockNum.toString());
            newOccupied.add((startBlockNum + 1).toString());
          }
          setOccupiedBlocks(newOccupied);
        } else {
          toast.error(response.error?.[0] || 'Error al crear horario');
          const errorMsg = response.error?.[0] || '';
          if (isRecess && errorMsg.includes('código') && retryCount < 3) {
            setRetryCount(prev => prev + 1);
            const newCode = generateRecessCode();
            setRecessCode(newCode);
            setValue('code', newCode);
            toast.info(`Reintentando con nuevo código: ${newCode}`);
          }
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Error al crear horario');
      },
    });
  };

  const isBlockOccupied = (blockNumber: number) => occupiedBlocks.has(blockNumber.toString());

  const currentBlock = startBlock ? parseInt(startBlock) : 1;
  const timeRange = {
    start: ['7:00','7:40','8:20','9:00','10:00','10:40','11:20','12:00','12:40'][currentBlock-1],
    end: ['7:40','8:20','9:00','9:40','10:40','11:20','12:00','12:40','13:20'][currentBlock]
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agregar Nuevo Horario</h2>
        <p className="text-gray-600">Complete los campos requeridos (*) o cargue un horario existente</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Opción: Cargar horario existente */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showExistingLoader}
              onChange={handleToggleExistingLoader}
              className="form-checkbox h-5 w-5 text-blue-600"
              disabled={isRecess}
            />
            <span className="ml-2 text-gray-700 font-medium">Cargar horario existente</span>
          </label>
          {showExistingLoader && (
            <div className="flex-1">
              <select
                value={selectedExistingId}
                onChange={handleSelectExistingSchedule}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={loadingExistingSchedules}
              >
                <option value="">-- Seleccione un horario --</option>
                {existingSchedules.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.subject?.name || 'RECESO'} ({s.grade} {s.section} - {s.day})
                  </option>
                ))}
              </select>
              {loadingExistingSchedules && <p className="text-sm text-gray-500 mt-1">Cargando horarios...</p>}
              {!loadingExistingSchedules && existingSchedules.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">No hay horarios disponibles.</p>
              )}
            </div>
          )}
        </div>

        {/* Receso toggle (solo si no se cargó un horario existente) */}
        {!showExistingLoader && (
          <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRecess}
                onChange={handleRecessChange}
                className="form-checkbox h-5 w-5 text-yellow-600"
              />
              <span className="ml-2 text-gray-700 font-medium">Marcar como Receso</span>
            </label>
            {isRecess && (
              <div className="text-sm text-gray-600">
                Código generado: <span className="font-mono bg-white px-2 py-0.5 border rounded">{recessCode}</span>
                {retryCount > 0 && <span className="ml-2 text-yellow-600"> (reintento {retryCount}/3)</span>}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código del horario */}
          <div className="flex flex-col">
            <label htmlFor="code" className="text-gray-700 font-bold mb-1">
              Código del Horario (7 dígitos) *
            </label>
            <input
              id="code"
              type="text"
              {...register('code', {
                required: isRecess ? false : 'El código es requerido',
                pattern: {
                  value: /^[A-Z0-9]{7}$/,
                  message: 'Debe tener exactamente 7 caracteres alfanuméricos mayúsculas',
                },
              })}
              disabled={showExistingLoader || isRecess}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.code ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring focus:border-blue-300 ${
                (showExistingLoader || isRecess) ? 'bg-gray-100 text-gray-600' : ''
              }`}
              placeholder={isRecess ? 'Automático' : 'Ej: 1V2526'}
            />
            {errors.code && <span className="text-red-500 text-sm mt-1">{errors.code.message}</span>}
            <p className="text-xs text-gray-500 mt-1">Formato: 7 caracteres alfanuméricos mayúsculas</p>
          </div>

          {/* Grado */}
          <div className="flex flex-col">
            <label htmlFor="grade" className="text-gray-700 font-bold mb-1">
              Grado *
            </label>
            <select
              id="grade"
              {...register('grade', { required: 'El grado es requerido' })}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.grade ? "border-red-500" : "border-gray-300"
              } rounded-md`}
            >
              <option value="">Seleccione un grado</option>
              {GRADE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.text}</option>
              ))}
            </select>
            {errors.grade && <span className="text-red-500 text-sm mt-1">{errors.grade.message}</span>}
          </div>

          {/* Sección */}
          <div className="flex flex-col">
            <label htmlFor="section" className="text-gray-700 font-bold mb-1">
              Sección *
            </label>
            <select
              id="section"
              {...register('section', { required: 'La sección es requerida' })}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.section ? "border-red-500" : "border-gray-300"
              } rounded-md`}
            >
              <option value="">Seleccione una sección</option>
              {SECTION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.text}</option>
              ))}
            </select>
            {errors.section && <span className="text-red-500 text-sm mt-1">{errors.section.message}</span>}
          </div>

          {/* Día */}
          <div className="flex flex-col">
            <label htmlFor="day" className="text-gray-700 font-bold mb-1">
              Día *
            </label>
            <select
              id="day"
              {...register('day', { required: 'El día es requerido' })}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.day ? "border-red-500" : "border-gray-300"
              } rounded-md`}
            >
              <option value="">Seleccione un día</option>
              {DAY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.text}</option>
              ))}
            </select>
            {errors.day && <span className="text-red-500 text-sm mt-1">{errors.day.message}</span>}
          </div>

          {/* Bloque */}
          <div className="flex flex-col">
            <label htmlFor="startBlock" className="text-gray-700 font-bold mb-1">
              Bloque Inicial *
            </label>
            <select
              id="startBlock"
              {...register('startBlock', { required: 'El bloque inicial es requerido' })}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.startBlock ? "border-red-500" : "border-gray-300"
              } rounded-md`}
            >
              <option value="">Seleccione un bloque</option>
              {BLOCK_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} disabled={isBlockOccupied(parseInt(opt.value))}>
                  {opt.text}
                </option>
              ))}
            </select>
            {errors.startBlock && <span className="text-red-500 text-sm mt-1">{errors.startBlock.message}</span>}
            {startBlock && (
              <p className="text-xs text-gray-500 mt-1">
                {isRecess
                  ? `Receso: Bloque único - Horario: ${timeRange.start} - ${timeRange.end}`
                  : `Materia: 2 bloques (${timeRange.start} - ${timeRange.end})`
                }
              </p>
            )}
          </div>

          {/* Materia (oculto si es receso) */}
          {!isRecess && (
            <div className="flex flex-col">
              <label htmlFor="subjectId" className="text-gray-700 font-bold mb-1">
                Materia *
              </label>
              <select
                id="subjectId"
                {...register('subjectId', { required: !isRecess ? 'La materia es requerida' : false })}
                className={`w-full px-3 py-2 border-2 border-solid ${
                  errors.subjectId ? "border-red-500" : "border-gray-300"
                } rounded-md`}
                disabled={loadingSubjects}
              >
                <option value="">Seleccione una materia</option>
                {subjects.map((subject: any) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
              {loadingSubjects && <span className="text-sm text-gray-500 mt-1">Cargando materias...</span>}
              {errors.subjectId && <span className="text-red-500 text-sm mt-1">{errors.subjectId.message}</span>}
            </div>
          )}

          {/* Docente */}
          {!isRecess && (
            <div className="flex flex-col">
              <label htmlFor="teacherId" className="text-gray-700 font-bold mb-1">
                Docente
              </label>
              <select
                id="teacherId"
                {...register('teacherId')}
                className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md"
                disabled={loadingTeachers}
              >
                <option value="">Sin docente asignado</option>
                {teachers.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.fullName} {t.specialization ? `(${t.specialization})` : ''}</option>
                ))}
              </select>
              {loadingTeachers && <span className="text-sm text-gray-500 mt-1">Cargando docentes...</span>}
            </div>
          )}

          {/* Aula */}
          <div className="flex flex-col">
            <label htmlFor="classroom" className="text-gray-700 font-bold mb-1">
              Aula
            </label>
            <input
              id="classroom"
              type="text"
              {...register('classroom')}
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md"
              placeholder="Ej: A-101"
            />
          </div>

          {/* Edificio */}
          <div className="flex flex-col">
            <label htmlFor="building" className="text-gray-700 font-bold mb-1">
              Edificio
            </label>
            <input
              id="building"
              type="text"
              {...register('building')}
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md"
              placeholder="Ej: Principal"
            />
          </div>
        </div>

        {/* Resumen de horario seleccionado */}
        {grade && section && day && startBlock && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Resumen del bloque a asignar</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-gray-500">Día:</span> <span className="font-medium capitalize">{day}</span></div>
              <div><span className="text-gray-500">Bloque:</span> <span className="font-medium">{startBlock} {isRecess ? '(receso)' : `y ${parseInt(startBlock)+1}`}</span></div>
              <div><span className="text-gray-500">Horario:</span> <span className="font-medium">{timeRange.start} - {timeRange.end}</span></div>
              <div><span className="text-gray-500">Estado:</span> <span className="font-medium text-green-600">Disponible</span></div>
            </div>
          </div>
        )}

        {/* Botón de envío */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center"
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Horario'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}