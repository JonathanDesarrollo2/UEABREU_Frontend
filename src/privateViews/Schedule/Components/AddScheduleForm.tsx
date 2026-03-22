import { useEffect, useState } from 'react';
import { useAddSchedule } from '../hooks/useAddSchedule';
import { useScheduleForm, type ScheduleFormValues } from '../hooks/useScheduleForm';
import { toast } from 'react-toastify';
import { getActiveTeachersAPI, getSchedulesByGradeSectionAPI, getSubjectsAPI } from '../../../apis/schedule';
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

export default function AddScheduleForm({ onPreviewChange }: AddScheduleFormProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useScheduleForm();
  const { mutate, isPending } = useAddSchedule();
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [occupiedBlocks, setOccupiedBlocks] = useState<Set<string>>(new Set());
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [isRecess, setIsRecess] = useState(false);
  
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
      .catch((error) => {
        console.error('Error cargando materias:', error);
        toast.error('Error al cargar materias');
        setSubjects([]);
      })
      .finally(() => {
        setLoadingSubjects(false);
      });
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
    if (checked) {
      setValue('subjectId', ''); // Limpiar materia
      setValue('teacherId', ''); // Limpiar docente
      setValue('classroom', ''); // Limpiar aula
      setValue('building', '');  // Limpiar edificio
    }
  };

  const onSubmit = (formData: ScheduleFormValues) => {
    const startBlockNum = parseInt(formData.startBlock);
    
    if (occupiedBlocks.has(startBlockNum.toString())) {
      toast.error('Este bloque ya está ocupado para este día');
      return;
    }

    if (!isRecess && !formData.subjectId) {
      toast.error('Debe seleccionar una materia o marcar como receso');
      return;
    }

    // Convertir a TypeScheduleCreate para la API
    const payload: TypeScheduleCreate = {
      code: formData.code,
      grade: formData.grade,
      section: formData.section,
      day: formData.day,
      startBlock: startBlockNum,
      endBlock: startBlockNum + 1,
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
          // Actualizar bloques ocupados localmente
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

  const currentBlock = startBlock ? parseInt(startBlock) : 1;
  const timeRange = getBlockTimes(currentBlock);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agregar Nuevo Horario</h2>
        <p className="text-gray-600">Complete todos los campos requeridos (*)</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código */}
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
                    value: /^[0-9A-Z]{7}$/,
                    message: 'Debe tener exactamente 7 dígitos/letras'
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
              <p className="text-xs text-gray-500 mt-1">Formato: 1V2526 (7 caracteres exactos)</p>
            </div>
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
              Día de la Semana *
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

          {/* Bloque Inicial */}
          <div className="space-y-2">
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
              >
                <option value="">Seleccione un bloque</option>
                {BLOCK_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
              {errors.startBlock && (
                <span className="text-red-500 text-sm mt-1">{errors.startBlock.message as string}</span>
              )}
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Bloque Final:</span> {currentBlock + 1}
                <span className="ml-2 text-gray-600">
                  (Horario: {timeRange.start} - {timeRange.end})
                </span>
              </p>
              {isBlockOccupied(currentBlock) && (
                <p className="text-red-600 text-sm mt-1 font-semibold">
                  ⚠️ Este bloque está ocupado. No puede asignar materia aquí.
                </p>
              )}
            </div>
          </div>

          {/* Checkbox para Receso */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRecess"
              checked={isRecess}
              onChange={handleRecessChange}
              className="h-5 w-5 text-blue-600"
            />
            <label htmlFor="isRecess" className="text-gray-700 font-medium">
              Es un receso
            </label>
          </div>

          {/* Campos visibles solo si NO es receso */}
          {!isRecess && (
            <>
              {/* Materia */}
              <div className="flex flex-col">
                <label htmlFor="subjectId" className="text-gray-700 font-bold mb-1">
                  Materia *
                </label>
                <select
                  id="subjectId"
                  {...register('subjectId')}
                  className={`w-full px-3 py-2 border-2 border-solid ${
                    errors.subjectId ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
                  disabled={loadingSubjects}
                >
                  <option value="">{loadingSubjects ? 'Cargando materias...' : 'Seleccione una materia'}</option>
                  {!loadingSubjects && subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
                {errors.subjectId && (
                  <span className="text-red-500 text-sm mt-1">{errors.subjectId.message as string}</span>
                )}
                {subjects.length === 0 && !loadingSubjects && (
                  <span className="text-yellow-600 text-sm mt-1">
                    No hay materias registradas. Primero agregue materias en la pestaña "Agregar Materia".
                  </span>
                )}
              </div>

              {/* Docente */}
              <div className="flex flex-col">
                <label htmlFor="teacherId" className="text-gray-700 font-bold mb-1">
                  Docente (opcional)
                </label>
                <select
                  id="teacherId"
                  {...register('teacherId')}
                  className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  disabled={loadingTeachers}
                >
                  <option value="">{loadingTeachers ? 'Cargando docentes...' : 'Seleccione un docente'}</option>
                  {!loadingTeachers && teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName} - {teacher.specialization || 'Sin especialización'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aula */}
              <div className="flex flex-col">
                <label htmlFor="classroom" className="text-gray-700 font-bold mb-1">
                  Aula (opcional)
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
                  Edificio (opcional)
                </label>
                <input
                  id="building"
                  type="text"
                  {...register('building')}
                  className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Ej: Edificio Principal"
                />
              </div>
            </>
          )}
        </div>

        {/* Resumen */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Resumen del Horario</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Grado:</span>
              <span className="ml-2 font-medium">
                {GRADE_OPTIONS.find(g => g.value === grade)?.text || 'No seleccionado'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Sección:</span>
              <span className="ml-2 font-medium">
                {SECTION_OPTIONS.find(s => s.value === section)?.text || 'No seleccionado'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Día:</span>
              <span className="ml-2 font-medium">
                {DAY_OPTIONS.find(d => d.value === day)?.text || 'No seleccionado'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Bloques:</span>
              <span className="ml-2 font-medium">
                {startBlock ? `${currentBlock} - ${currentBlock + 1}` : 'No seleccionado'}
              </span>
            </div>
          </div>
          {isRecess && (
            <div className="mt-3 text-sm text-blue-600 font-medium">
              ✓ Este horario se creará como RECESO (sin materia asignada)
            </div>
          )}
        </div>

        {/* Notas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📝 Notas importantes:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Código:</strong> 7 dígitos/letras (ej: 1V2526)</li>
            <li>• Cada materia ocupa <strong>2 bloques consecutivos</strong></li>
            <li>• Las materias se pueden asignar a cualquier grado/sección</li>
            <li>• Verifique que el bloque no esté ocupado antes de guardar</li>
            <li>• <strong>Recesos:</strong> Marque la casilla "Es un receso" para crear un bloque sin materia.</li>
          </ul>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isPending || !grade || !section || !day || !startBlock || (!isRecess && !subjectId)}
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