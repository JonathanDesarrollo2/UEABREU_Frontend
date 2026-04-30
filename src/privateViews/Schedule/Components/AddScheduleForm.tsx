import { useEffect, useState } from 'react';
import { useAddSchedule } from '../hooks/useAddSchedule';
import { useScheduleForm, type ScheduleFormValues } from '../hooks/useScheduleForm';
import { toast } from 'react-toastify';
import {
  getActiveTeachersAPI,
  getSchedulesByGradeSectionAPI,
  getSubjectsAPI,
  getScheduleByIdAPI, // NUEVA: para cargar un horario existente
  getSchedulesAPI,     // NUEVA: para listar horarios disponibles
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
  
  // Estados existentes
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [occupiedBlocks, setOccupiedBlocks] = useState<Set<string>>(new Set());
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [isRecess, setIsRecess] = useState(false);
  const [recessCode, setRecessCode] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  
  // NUEVOS: Para cargar horario existente
  const [availableSchedules, setAvailableSchedules] = useState<any[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  
  const grade = watch('grade');
  const section = watch('section');
  const day = watch('day');
  const startBlock = watch('startBlock');
  const subjectId = watch('subjectId');

  // Cargar materias (sin cambios)
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
      .catch((error) => {
        console.error('Error cargando materias:', error);
        toast.error('Error al cargar materias');
        setSubjects([]);
      })
      .finally(() => {
        setLoadingSubjects(false);
      });
  }, []);

  // Cargar docentes activos (sin cambios)
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
      .catch((error) => {
        console.error('Error cargando docentes:', error);
        toast.error('Error al cargar docentes');
        setTeachers([]);
      })
      .finally(() => {
        setLoadingTeachers(false);
      });
  }, []);

  // Cargar bloques ocupados (vista previa) - sin cambios
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
        .catch((error) => {
          console.error('Error cargando horarios:', error);
        });
    }
  }, [grade, section, day]);

  // Notificar cambios para vista previa (sin cambios)
  useEffect(() => {
    if (onPreviewChange && grade && section) {
      onPreviewChange(grade, section);
    }
  }, [grade, section, onPreviewChange]);

  // Autocompletar docente al seleccionar materia (sin cambios)
  useEffect(() => {
    if (subjectId) {
      const selectedSubject = subjects.find(s => s.id === subjectId);
      if (selectedSubject?.teacherId) {
        setValue('teacherId', selectedSubject.teacherId);
      }
    }
  }, [subjectId, subjects, setValue]);

  // NUEVO: Cargar lista de horarios existentes cuando se tengan grado y sección
  useEffect(() => {
    if (!grade || !section) {
      setAvailableSchedules([]);
      return;
    }
    setLoadingSchedules(true);
    getSchedulesAPI({ grade, section })
      .then(response => {
        if (response.result && Array.isArray(response.content)) {
          setAvailableSchedules(response.content);
        } else {
          setAvailableSchedules([]);
        }
      })
      .catch(error => {
        console.error('Error al cargar horarios existentes:', error);
        setAvailableSchedules([]);
      })
      .finally(() => setLoadingSchedules(false));
  }, [grade, section]);

  // Manejar cambio del checkbox "Receso" (sin cambios)
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
    } else {
      setRecessCode('');
      setValue('code', '');
    }
  };

  // NUEVA FUNCIÓN: Cargar los datos de un horario seleccionado en el formulario
  const handleLoadSchedule = async () => {
    if (!selectedScheduleId) return;
    try {
      const response = await getScheduleByIdAPI(selectedScheduleId);
      if (!response.result || !response.content) {
        toast.error('No se pudo cargar el horario seleccionado');
        return;
      }
      const schedule = response.content;
      // Rellenar campos
      setValue('subjectId', schedule.subjectId || '');
      setValue('teacherId', schedule.teacherId || '');
      setValue('classroom', schedule.classroom || '');
      setValue('building', schedule.building || '');
      // Opcionalmente, cargar día y bloque (el usuario puede cambiarlos)
      setValue('day', schedule.day);
      setValue('startBlock', String(schedule.startBlock));
      // Si es receso, ajustar
      if (!schedule.subjectId) {
        setIsRecess(true);
        setRecessCode(generateRecessCode()); // generar nuevo código para receso
        setValue('code', generateRecessCode());
      } else {
        setIsRecess(false);
        setValue('code', ''); // el código debe ser ingresado manualmente
      }
      toast.success('Horario cargado correctamente. Cambia el día/bloque si deseas duplicarlo.');
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar horario');
    }
  };

  const onSubmit = (formData: ScheduleFormValues) => {
    const startBlockNum = parseInt(formData.startBlock);
    const endBlockNum = isRecess ? startBlockNum : startBlockNum + 1;

    // Validación de bloques ocupados (sin cambios)
    if (isRecess) {
      if (occupiedBlocks.has(startBlockNum.toString())) {
        toast.error('Este bloque ya está ocupado para este día');
        return;
      }
    } else {
      if (occupiedBlocks.has(startBlockNum.toString()) || 
          occupiedBlocks.has((startBlockNum + 1).toString())) {
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
          // Actualizar bloques ocupados
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
        console.error('Error al crear horario:', error);
        toast.error(error.message || 'Error al crear horario');
      },
    });
  };

  const isBlockOccupied = (blockNumber: number) => {
    return occupiedBlocks.has(blockNumber.toString());
  };

  const getBlockTimes = (blockNumber: number) => {
    const blockTimes: Record<number, string> = {
      1: '7:00',
      2: '7:40',
      3: '8:20',
      4: '9:00',
      5: '10:00',
      6: '10:40',
      7: '11:20',
      8: '12:00',
      9: '12:40'
    };
    return {
      start: blockTimes[blockNumber] || '',
      end: blockTimes[blockNumber + 1] || '13:20'
    };
  };

  const currentBlock = startBlock ? parseInt(startBlock) : 1;
  const timeRange = getBlockTimes(currentBlock);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agregar Nuevo Horario</h2>
        <p className="text-gray-600">Complete todos los campos requeridos (*)</p>
      </div>

      {/* ======= NUEVA SECCIÓN: Cargar horario existente ======= */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-3 text-lg">📋 Cargar Horario Existente (Duplicar)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona un horario ya creado para cargar automáticamente sus datos. Luego puedes cambiar el día o el bloque para agregarlo en otro espacio.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horario existente
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              disabled={loadingSchedules || !grade || !section}
            >
              <option value="">{!grade || !section ? 'Primero elige grado y sección' : 'Seleccione un horario...'}</option>
              {availableSchedules.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.code} - {sch.subject?.name || 'RECESO'} ({sch.day}, B{sch.startBlock})
                </option>
              ))}
            </select>
            {loadingSchedules && <span className="text-sm text-gray-500">Cargando horarios...</span>}
          </div>
          <button
            type="button"
            onClick={handleLoadSchedule}
            disabled={!selectedScheduleId}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cargar
          </button>
        </div>
      </div>
      {/* =========== FIN NUEVA SECCIÓN =========== */}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* El resto del formulario es idéntico al original */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código - solo visible cuando NO es receso */}
          {!isRecess && (
            <div className="md:col-span-2">
              <div className="flex flex-col">
                <label htmlFor="code" className="text-gray-700 font-bold mb-1">
                  Código del Horario (7 dígitos, ejemplo: 1V2526) *
                </label>
                <input
                  id="code"
                  type="text"
                  {...register('code', { 
                    required: 'El código es requerido',
                    pattern: {
                      value: /^[A-Z0-9]{7}$/,
                      message: 'Debe tener exactamente 7 caracteres alfanuméricos mayúsculas'
                    }
                  })}
                  className={`w-full px-3 py-2 border-2 border-solid ${
                    errors.code ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
                  placeholder="Ej: 1V2526"
                />
                {errors.code && (
                  <span className="text-red-500 text-sm mt-1">{errors.code.message as string}</span>
                )}
                <p className="text-xs text-gray-500 mt-1">Formato: 1V2526 (7 caracteres alfanuméricos mayúsculas)</p>
              </div>
            </div>
          )}

          {/* Si es receso, mostrar mensaje informativo */}
          {isRecess && (
            <div className="md:col-span-2 bg-gray-100 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Código generado automáticamente:</span> {recessCode}
                {retryCount > 0 && <span className="ml-2 text-yellow-600">(Reintento {retryCount}/3)</span>}
              </p>
            </div>
          )}

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
              } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
            >
              <option value="">Seleccione un grado</option>
              {GRADE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.text}
                </option>
              ))}
            </select>
            {errors.grade && (
              <span className="text-red-500 text-sm mt-1">{errors.grade.message as string}</span>
            )}
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
              } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
            >
              <option value="">Seleccione una sección</option>
              {SECTION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.text}
                </option>
              ))}
            </select>
            {errors.section && (
              <span className="text-red-500 text-sm mt-1">{errors.section.message as string}</span>
            )}
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
              } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
            >
              <option value="">Seleccione un día</option>
              {DAY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.text}
                </option>
              ))}
            </select>
            {errors.day && (
              <span className="text-red-500 text-sm mt-1">{errors.day.message as string}</span>
            )}
          </div>

          {/* Bloque inicial */}
          <div className="flex flex-col">
            <label htmlFor="startBlock" className="text-gray-700 font-bold mb-1">
              Bloque Inicial *
            </label>
            <select
              id="startBlock"
              {...register('startBlock', { required: 'El bloque inicial es requerido' })}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.startBlock ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
              disabled={loadingSchedules}
            >
              <option value="">Seleccione un bloque</option>
              {BLOCK_OPTIONS.map(option => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={isBlockOccupied(parseInt(option.value))}
                >
                  {option.text} {isBlockOccupied(parseInt(option.value)) ? '(Ocupado)' : ''}
                </option>
              ))}
            </select>
            {errors.startBlock && (
              <span className="text-red-500 text-sm mt-1">{errors.startBlock.message as string}</span>
            )}
            {startBlock && (
              <p className="text-xs text-gray-500 mt-1">
                Horario: {timeRange.start} - {timeRange.end}
              </p>
            )}
          </div>
          <div className="flex items-center mt-8">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRecess}
                onChange={handleRecessChange}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-gray-700 font-bold">{isRecess ? 'Receso' : 'No es receso'}</span>
            </label>
          </div>

          {/* Materia (solo si no es receso) */}
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
                } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
                disabled={loadingSubjects || isRecess}
              >
                <option value="">Seleccione una materia</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
              {errors.subjectId && (
                <span className="text-red-500 text-sm mt-1">{errors.subjectId.message as string}</span>
              )}
              {loadingSubjects && <span className="text-sm text-gray-500">Cargando materias...</span>}
            </div>
          )}

          {/* Docente */}
          <div className="flex flex-col">
            <label htmlFor="teacherId" className="text-gray-700 font-bold mb-1">
              Docente
            </label>
            <select
              id="teacherId"
              {...register('teacherId')}
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              disabled={loadingTeachers || isRecess}
            >
              <option value="">Sin docente asignado</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                </option>
              ))}
            </select>
            {loadingTeachers && <span className="text-sm text-gray-500">Cargando docentes...</span>}
          </div>

          {/* Aula */}
          <div className="flex flex-col">
            <label htmlFor="classroom" className="text-gray-700 font-bold mb-1">
              Aula
            </label>
            <input
              id="classroom"
              type="text"
              {...register('classroom')}
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Ej: A-101"
              disabled={isRecess}
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
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Ej: Principal"
              disabled={isRecess}
            />
          </div>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {isPending ? 'Guardando...' : 'Guardar Horario'}
          </button>
        </div>
      </form>
    </div>
  );
}