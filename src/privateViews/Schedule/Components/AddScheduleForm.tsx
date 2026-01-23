import { useEffect, useState } from 'react';
import { useAddSchedule } from '../hooks/useAddSchedule';
import { useScheduleForm } from '../hooks/useScheduleForm';
import { toast } from 'react-toastify';
import { getActiveTeachersAPI, getSchedulesByGradeSectionAPI, getSubjectsByGradeAPI } from '../../../apis/schedule';
import { FormField } from '../../../components/FormField';
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
  
  const grade = watch('grade');
  const section = watch('section');
  const day = watch('day');
  // Convertir string a number para los cálculos
  const startBlockValue = watch('startBlock');
  const startBlock = typeof startBlockValue === 'string' ? parseInt(startBlockValue) : startBlockValue;
  const subjectId = watch('subjectId');

  // Cargar materias según el grado
  useEffect(() => {
    if (grade) {
      getSubjectsByGradeAPI(grade)
        .then(response => {
          if (response.result && response.content) {
            setSubjects(response.content);
          } else {
            console.warn('No se encontraron materias para el grado:', grade);
          }
        })
        .catch((error) => {
          console.error('Error cargando materias:', error);
          toast.error('Error al cargar materias');
        });
    }
  }, [grade]);

  // Cargar docentes activos
  useEffect(() => {
    getActiveTeachersAPI()
      .then(response => {
        if (response.result && response.content) {
          setTeachers(response.content);
        } else {
          console.warn('No se encontraron docentes activos');
        }
      })
      .catch((error) => {
        console.error('Error cargando docentes:', error);
        toast.error('Error al cargar docentes');
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
            <FormField
              id="code"
              label="Código del Horario (7 dígitos) *"
              required
              register={register}
              error={errors.code}
              validation={{
                pattern: {
                  value: /^\d+[A-Z]\d{4}$/,
                  message: 'Formato: Número+Grado+Año (ej: 1V2526)'
                }
              }}
            />
          </div>

          {/* Grado y Sección */}
          <FormField
            type="select"
            id="grade"
            label="Grado *"
            required
            register={register}
            error={errors.grade}
            options={GRADE_OPTIONS}
          />

          <FormField
            type="select"
            id="section"
            label="Sección *"
            required
            register={register}
            error={errors.section}
            options={SECTION_OPTIONS}
          />

          {/* Día y Bloque */}
          <FormField
            type="select"
            id="day"
            label="Día de la Semana *"
            required
            register={register}
            error={errors.day}
            options={DAY_OPTIONS}
          />

          <div className="space-y-2">
            <FormField
              type="select"
              id="startBlock"
              label="Bloque Inicial *"
              required
              register={register}
              error={errors.startBlock}
              options={BLOCK_OPTIONS}
            />
            
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

          {/* Materia */}
          <FormField
            type="select"
            id="subjectId"
            label="Materia *"
            required
            register={register}
            error={errors.subjectId}
            options={[
              { value: '', text: 'Seleccione una materia' },
              ...subjects.map(subject => ({
                value: subject.id,
                text: `${subject.name} (${subject.code})`
              }))
            ]}
          />

          {/* Docente - Select manual para evitar error de conversión */}
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
            >
              <option value="">Seleccione un docente</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName} - {teacher.specialization || 'Sin especialización'}
                </option>
              ))}
            </select>
            {errors.teacherId && (
              <span className="text-red-500 text-sm mt-1">{errors.teacherId.message as string}</span>
            )}
          </div>

          {/* Aula y Edificio */}
          <FormField
            id="classroom"
            label="Aula"
            register={register}
            error={errors.classroom}
          />

          <FormField
            id="building"
            label="Edificio"
            register={register}
            error={errors.building}
          />
        </div>

        {/* Resumen del horario */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Resumen del Horario</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Grado:</span>
              <span className="ml-2 font-medium">{grade || 'No seleccionado'}</span>
            </div>
            <div>
              <span className="text-gray-500">Sección:</span>
              <span className="ml-2 font-medium">{section || 'No seleccionado'}</span>
            </div>
            <div>
              <span className="text-gray-500">Día:</span>
              <span className="ml-2 font-medium">{day ? day.charAt(0).toUpperCase() + day.slice(1) : 'No seleccionado'}</span>
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