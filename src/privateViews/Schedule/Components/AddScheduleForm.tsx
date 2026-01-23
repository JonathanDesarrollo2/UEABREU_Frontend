import { useEffect, useState } from 'react';
import { useAddSchedule } from '../hooks/useAddSchedule';
import { useScheduleForm } from '../hooks/useScheduleForm';
import { toast } from 'react-toastify';
import { getActiveTeachersAPI, getSchedulesByGradeSectionAPI, getSubjectsAPI } from '../../../apis/schedule';
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

// Cambiar valores a string (FormField espera strings)
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

export default function AddScheduleForm({ onPreviewChange }: AddScheduleFormProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useScheduleForm();
  const { mutate, isPending } = useAddSchedule();
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [occupiedBlocks, setOccupiedBlocks] = useState<Set<string>>(new Set());
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  
  const grade = watch('grade');
  const section = watch('section');
  const day = watch('day');
  // Convertir string a number para los cálculos
  const startBlockValue = watch('startBlock');
  const startBlock = typeof startBlockValue === 'string' ? parseInt(startBlockValue) : startBlockValue;
  const subjectId = watch('subjectId');

  // Cargar materias - CAMBIADO: usar getSubjectsAPI sin filtrar por grado primero
  useEffect(() => {
    setLoadingSubjects(true);
    getSubjectsAPI({ grade: grade || undefined })
      .then(response => {
        console.log('Respuesta de materias:', response);
        if (response.result && response.content) {
          setSubjects(response.content);
        } else {
          console.warn('No se encontraron materias');
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
  }, [grade]);

  // Cargar docentes activos
  useEffect(() => {
    setLoadingTeachers(true);
    getActiveTeachersAPI()
      .then(response => {
        if (response.result && response.content) {
          setTeachers(response.content);
        } else {
          console.warn('No se encontraron docentes activos');
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
                // Si ocupa 2 bloques, marcar ambos
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

  // Notificar cambios para vista previa
  useEffect(() => {
    if (onPreviewChange && grade && section) {
      onPreviewChange(grade, section);
    }
  }, [grade, section, onPreviewChange]);

  // Actualizar docente cuando se selecciona materia
  useEffect(() => {
    if (subjectId) {
      const selectedSubject = subjects.find(s => s.id === subjectId);
      if (selectedSubject?.teacherId) {
        setValue('teacherId', selectedSubject.teacherId);
      }
    }
  }, [subjectId, subjects, setValue]);

  const onSubmit = (data: any) => {
    // Verificar si el bloque está ocupado
    const startBlockNum = typeof data.startBlock === 'string' ? parseInt(data.startBlock) : data.startBlock;
    
    if (occupiedBlocks.has(startBlockNum.toString())) {
      toast.error('Este bloque ya está ocupado para este día');
      return;
    }

    // Validar que se haya seleccionado una materia
    if (!data.subjectId) {
      toast.error('Debe seleccionar una materia');
      return;
    }

    // Calcular bloque final
    const formData = {
      ...data,
      startBlock: startBlockNum,
      endBlock: startBlockNum + 1,
    };

    console.log('Datos a enviar:', formData);

    mutate(formData, {
      onSuccess: (response: TypeApiResponseGeneric) => {
        if (response.result) {
          toast.success('Horario creado exitosamente');
          reset();
          // Actualizar bloques ocupados
          const newOccupied = new Set(occupiedBlocks);
          newOccupied.add(startBlockNum.toString());
          newOccupied.add((startBlockNum + 1).toString());
          setOccupiedBlocks(newOccupied);
        } else {
          toast.error(response.error?.[0] || 'Error al crear horario');
        }
      },
      onError: (error: Error) => {
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

  const timeRange = getBlockTimes(startBlock || 1);

  // Función para obtener texto del grado/sección/día seleccionado
  const getSelectedText = (value: string, options: Array<{value: string, text: string}>) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.text : 'No seleccionado';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agregar Nuevo Horario</h2>
        <p className="text-gray-600">Complete todos los campos requeridos (*)</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código - CAMBIADO: 6 dígitos en lugar de 7 según tu ejemplo */}
          <div className="md:col-span-2">
            <div className="flex flex-col">
              <label htmlFor="code" className="text-gray-700 font-bold mb-1">
                Código del Horario (6 dígitos, ej: 1V2526) *
              </label>
              <input
                id="code"
                type="text"
                {...register('code', { 
                  required: 'El código es requerido',
                  pattern: {
                    value: /^\d[A-Z]\d{4}$/,
                    message: 'Formato inválido (ej: 1V2526)'
                  },
                  minLength: { value: 6, message: 'Debe tener 6 caracteres' },
                  maxLength: { value: 6, message: 'Debe tener 6 caracteres' }
                })}
                className={`w-full px-3 py-2 border-2 border-solid ${
                  errors.code ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
                placeholder="1V2526"
              />
              {errors.code && (
                <span className="text-red-500 text-sm mt-1">{errors.code.message as string}</span>
              )}
            </div>
          </div>

          {/* Grado - CAMBIADO: Select manual para evitar conversión a número */}
          <div className="flex flex-col">
            <label htmlFor="grade" className="text-gray-700 font-bold mb-1">
              Grado *
            </label>
            <select
              id="grade"
              {...register('grade', { 
                required: 'El grado es requerido',
                // No usar setValueAs para conversión a número
              })}
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
              <span className="text-red-500 text-sm mt-1">{errors.grade?.message as string || 'Grado inválido'}</span>
            )}
          </div>

          {/* Sección - CAMBIADO: Select manual para evitar conversión a número */}
          <div className="flex flex-col">
            <label htmlFor="section" className="text-gray-700 font-bold mb-1">
              Sección *
            </label>
            <select
              id="section"
              {...register('section', { 
                required: 'La sección es requerida',
                // No usar setValueAs para conversión a número
              })}
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
              <span className="text-red-500 text-sm mt-1">{errors.section?.message as string || 'Sección inválida'}</span>
            )}
          </div>

          {/* Día - CAMBIADO: Select manual */}
          <div className="flex flex-col">
            <label htmlFor="day" className="text-gray-700 font-bold mb-1">
              Día de la Semana *
            </label>
            <select
              id="day"
              {...register('day', { 
                required: 'El día es requerido',
              })}
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
              <span className="text-red-500 text-sm mt-1">{errors.day?.message as string || 'Día inválido'}</span>
            )}
          </div>

          {/* Bloque Inicial - Select manual */}
          <div className="space-y-2">
            <div className="flex flex-col">
              <label htmlFor="startBlock" className="text-gray-700 font-bold mb-1">
                Bloque Inicial *
              </label>
              <select
                id="startBlock"
                {...register('startBlock', { 
                  required: 'El bloque inicial es requerido',
                })}
                className={`w-full px-3 py-2 border-2 border-solid ${
                  errors.startBlock ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
              >
                <option value="">Seleccione un bloque</option>
                {BLOCK_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
              {errors.startBlock && (
                <span className="text-red-500 text-sm mt-1">{errors.startBlock?.message as string}</span>
              )}
            </div>
            
            {/* Indicador visual del bloque final */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Bloque Final:</span> {(startBlock || 1) + 1}
                <span className="ml-2 text-gray-600">
                  (Horario: {timeRange.start} - {timeRange.end})
                </span>
              </p>
              
              {/* Advertencia si el bloque está ocupado */}
              {isBlockOccupied(startBlock || 1) && (
                <p className="text-red-600 text-sm mt-1 font-semibold">
                  ⚠️ Este bloque está ocupado. No puede asignar materia aquí.
                </p>
              )}
            </div>
          </div>

          {/* Materia - Select manual */}
          <div className="flex flex-col">
            <label htmlFor="subjectId" className="text-gray-700 font-bold mb-1">
              Materia *
            </label>
            <select
              id="subjectId"
              {...register('subjectId', { 
                required: 'La materia es requerida',
              })}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.subjectId ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
              disabled={loadingSubjects}
            >
              <option value="">{loadingSubjects ? 'Cargando materias...' : 'Seleccione una materia'}</option>
              {!loadingSubjects && subjects.length === 0 && (
                <option value="" disabled>No hay materias disponibles</option>
              )}
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <span className="text-red-500 text-sm mt-1">{errors.subjectId?.message as string || 'Materia inválida'}</span>
            )}
            {subjects.length === 0 && !loadingSubjects && grade && (
              <span className="text-yellow-600 text-sm mt-1">
                No hay materias registradas para el grado {grade}. Primero agregue materias en la pestaña "Agregar Materia".
              </span>
            )}
          </div>

          {/* Docente - Select manual */}
          <div className="flex flex-col">
            <label htmlFor="teacherId" className="text-gray-700 font-bold mb-1">
              Docente (opcional)
            </label>
            <select
              id="teacherId"
              {...register('teacherId')}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.teacherId ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
              disabled={loadingTeachers}
            >
              <option value="">{loadingTeachers ? 'Cargando docentes...' : 'Seleccione un docente'}</option>
              {!loadingTeachers && teachers.length === 0 && (
                <option value="" disabled>No hay docentes disponibles</option>
              )}
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName} - {teacher.specialization || 'Sin especialización'}
                </option>
              ))}
            </select>
            {errors.teacherId && (
              <span className="text-red-500 text-sm mt-1">{errors.teacherId?.message as string}</span>
            )}
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
              placeholder="Ej: Aula 101"
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
              placeholder="Ej: Edificio Principal"
            />
          </div>
        </div>

        {/* Resumen del horario - CORREGIDO: mostrar valores reales */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Resumen del Horario</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Grado:</span>
              <span className="ml-2 font-medium">{getSelectedText(grade, GRADE_OPTIONS)}</span>
            </div>
            <div>
              <span className="text-gray-500">Sección:</span>
              <span className="ml-2 font-medium">{getSelectedText(section, SECTION_OPTIONS)}</span>
            </div>
            <div>
              <span className="text-gray-500">Día:</span>
              <span className="ml-2 font-medium">{getSelectedText(day, DAY_OPTIONS)}</span>
            </div>
            <div>
              <span className="text-gray-500">Bloques:</span>
              <span className="ml-2 font-medium">{startBlock ? `${startBlock} - ${startBlock + 1}` : 'No seleccionado'}</span>
            </div>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isPending || !grade || !section || !day || !subjectId}
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