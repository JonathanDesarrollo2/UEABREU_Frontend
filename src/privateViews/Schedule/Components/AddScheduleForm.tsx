import { useEffect, useState, useRef } from 'react';
import { useAddSchedule } from '../hooks/useAddSchedule';
import { useScheduleForm, type ScheduleFormValues } from '../hooks/useScheduleForm';
import { toast } from 'react-toastify';
import {
  getActiveTeachersAPI,
  getSchedulesByGradeSectionAPI,
  getSubjectsAPI,
} from '../../../apis/schedule';
import type { TypeScheduleCreate } from '../../../types/schedule';
import type { TypeApiResponseGeneric } from '../../../types/schedule';
import { FaBook, FaChalkboardTeacher } from 'react-icons/fa';

// Opciones estáticas
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

const generateRecessCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const combined = (timestamp + random).replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return `R${combined.padEnd(6, '0')}`;
};

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
  const [recessCode, setRecessCode] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Referencia para scroll suave a la sección de materias
  const subjectsGridRef = useRef<HTMLDivElement>(null);

  const grade = watch('grade');
  const section = watch('section');
  const day = watch('day');
  const startBlock = watch('startBlock');
  const subjectId = watch('subjectId');

  // Cargar todas las materias (sin filtros)
  useEffect(() => {
    setLoadingSubjects(true);
    getSubjectsAPI()
      .then(response => {
        if (response.result && response.content) {
          setSubjects(response.content.filter((s: any) => s.name !== 'RECESO')); // Quitamos recesos
        } else {
          setSubjects([]);
        }
      })
      .catch(() => {
        toast.error('Error al cargar materias');
        setSubjects([]);
      })
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

  // Bloques ocupados según día
  useEffect(() => {
    if (grade && section && day) {
      getSchedulesByGradeSectionAPI(grade, section)
        .then(response => {
          if (response.result && response.content?.schedulesByDay?.[day]) {
            const occupied = new Set<string>();
            response.content.schedulesByDay[day].forEach((block: any) => {
              if (block.isOccupied || block.subject) {
                occupied.add(block.blockId.toString());
                if (block.spans === 2) occupied.add((block.blockId + 1).toString());
              }
            });
            setOccupiedBlocks(occupied);
          }
        })
        .catch(() => {});
    }
  }, [grade, section, day]);

  // Vista previa
  useEffect(() => {
    if (onPreviewChange && grade && section) {
      onPreviewChange(grade, section);
    }
  }, [grade, section, onPreviewChange]);

  // Auto-asignar docente al cambiar materia
  useEffect(() => {
    if (subjectId) {
      const subject = subjects.find(s => s.id === subjectId);
      if (subject?.teacherId) setValue('teacherId', subject.teacherId);
    }
  }, [subjectId, subjects, setValue]);

  const handleRecessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsRecess(checked);
    setRetryCount(0);
    if (checked) {
      const code = generateRecessCode();
      setRecessCode(code);
      setValue('code', code);
      setValue('subjectId', '');
      setValue('teacherId', '');
      setValue('classroom', '');
      setValue('building', '');
    } else {
      setRecessCode('');
      setValue('code', '');
    }
  };

  // Función para cargar datos de una materia seleccionada desde la tarjeta
  const handleLoadSubject = (subject: any) => {
    setValue('subjectId', subject.id);
    if (subject.teacherId) setValue('teacherId', subject.teacherId);
    // Desmarcar receso si estuviera activo
    if (isRecess) {
      setIsRecess(false);
      setValue('code', '');
    }
    // Scroll suave hacia el formulario (opcional)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = (formData: ScheduleFormValues) => {
    const startBlockNum = parseInt(formData.startBlock);
    const endBlockNum = isRecess ? startBlockNum : startBlockNum + 1;

    if (isRecess) {
      if (occupiedBlocks.has(startBlockNum.toString())) {
        toast.error('Este bloque ya está ocupado');
        return;
      }
    } else {
      if (
        occupiedBlocks.has(startBlockNum.toString()) ||
        occupiedBlocks.has((startBlockNum + 1).toString())
      ) {
        toast.error('Uno de los bloques ya está ocupado');
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
          if (isRecess && response.error?.[0]?.includes('código') && retryCount < 3) {
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

  const getBlockTimes = (blockNumber: number) => {
    const times: Record<number, { start: string; end: string }> = {
      1: { start: '7:00', end: '7:40' },
      2: { start: '7:40', end: '8:20' },
      3: { start: '8:20', end: '9:00' },
      4: { start: '9:00', end: '9:40' },
      5: { start: '10:00', end: '10:40' },
      6: { start: '10:40', end: '11:20' },
      7: { start: '11:20', end: '12:00' },
      8: { start: '12:00', end: '12:40' },
    };
    return times[blockNumber] || { start: '', end: '' };
  };

  const currentBlock = startBlock ? parseInt(startBlock) : 1;
  const timeRange = getBlockTimes(currentBlock);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agregar Nuevo Horario</h2>
        <p className="text-gray-600">Complete los campos requeridos (*) o use las materias rápidas abajo</p>
      </div>

      {/* ====== NUEVA SECCIÓN: Materias disponibles (tarjetas) ====== */}
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <FaBook className="text-blue-600" />
            Materias disponibles (clic para cargar)
          </h3>
          {loadingSubjects && (
            <span className="text-sm text-gray-500 animate-pulse">Cargando materias…</span>
          )}
        </div>

        {!loadingSubjects && subjects.length === 0 && (
          <p className="text-gray-500 text-sm">No hay materias registradas todavía.</p>
        )}

        <div
          ref={subjectsGridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-60 overflow-y-auto pr-1"
        >
          {subjects.map((subject) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => handleLoadSubject(subject)}
              className={`text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-md hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                subjectId === subject.id
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-300'
                  : 'border-gray-200 bg-gray-50 hover:bg-white'
              }`}
            >
              <div className="font-medium text-gray-800 truncate">{subject.name}</div>
              <div className="text-xs text-gray-500 truncate">{subject.code}</div>
              {subject.teacher && (
                <div className="flex items-center gap-1 mt-1 text-xs text-blue-700">
                  <FaChalkboardTeacher className="w-3 h-3" />
                  <span className="truncate">{subject.teacher.fullName}</span>
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Haz clic en una materia para cargarla en el formulario. Luego selecciona grado, sección, día y bloque.
        </p>
      </div>
      {/* =========================================================== */}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código (cuando no es receso) */}
          {!isRecess && (
            <div className="md:col-span-2">
              <label htmlFor="code" className="text-gray-700 font-bold mb-1 block">
                Código del Horario (7 dígitos) *
              </label>
              <input
                id="code"
                type="text"
                {...register('code', {
                  required: 'El código es requerido',
                  pattern: {
                    value: /^[A-Z0-9]{7}$/,
                    message: 'Debe tener 7 caracteres alfanuméricos mayúsculas',
                  },
                })}
                className={`w-full px-3 py-2 border-2 border-solid rounded-md focus:outline-none focus:ring focus:border-blue-300 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: 1V2526"
              />
              {errors.code && <span className="text-red-500 text-sm mt-1">{errors.code.message as string}</span>}
              <p className="text-xs text-gray-500 mt-1">Formato: 7 caracteres alfanuméricos mayúsculas</p>
            </div>
          )}

          {isRecess && (
            <div className="md:col-span-2 bg-gray-100 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Código automático:</span> {recessCode}
                {retryCount > 0 && <span className="ml-2 text-yellow-600">(Reintento {retryCount}/3)</span>}
              </p>
            </div>
          )}

          {/* Grado */}
          <div>
            <label htmlFor="grade" className="text-gray-700 font-bold mb-1 block">
              Grado *
            </label>
            <select
              id="grade"
              {...register('grade', { required: 'El grado es requerido' })}
              className={`w-full px-3 py-2 border-2 border-solid rounded-md focus:outline-none focus:ring ${
                errors.grade ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un grado</option>
              {GRADE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.text}</option>
              ))}
            </select>
            {errors.grade && <span className="text-red-500 text-sm">{errors.grade.message as string}</span>}
          </div>

          {/* Sección */}
          <div>
            <label htmlFor="section" className="text-gray-700 font-bold mb-1 block">
              Sección *
            </label>
            <select
              id="section"
              {...register('section', { required: 'La sección es requerida' })}
              className={`w-full px-3 py-2 border-2 border-solid rounded-md focus:outline-none focus:ring ${
                errors.section ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione una sección</option>
              {SECTION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.text}</option>
              ))}
            </select>
            {errors.section && <span className="text-red-500 text-sm">{errors.section.message as string}</span>}
          </div>

          {/* Día */}
          <div>
            <label htmlFor="day" className="text-gray-700 font-bold mb-1 block">
              Día *
            </label>
            <select
              id="day"
              {...register('day', { required: 'El día es requerido' })}
              className={`w-full px-3 py-2 border-2 border-solid rounded-md focus:outline-none focus:ring ${
                errors.day ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un día</option>
              {DAY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.text}</option>
              ))}
            </select>
            {errors.day && <span className="text-red-500 text-sm">{errors.day.message as string}</span>}
          </div>

          {/* Bloque inicial */}
          <div>
            <label htmlFor="startBlock" className="text-gray-700 font-bold mb-1 block">
              Bloque Inicial *
            </label>
            <select
              id="startBlock"
              {...register('startBlock', { required: 'El bloque inicial es requerido' })}
              className={`w-full px-3 py-2 border-2 border-solid rounded-md focus:outline-none focus:ring ${
                errors.startBlock ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un bloque</option>
              {BLOCK_OPTIONS.map(o => (
                <option
                  key={o.value}
                  value={o.value}
                  disabled={isBlockOccupied(parseInt(o.value))}
                >
                  {o.text} {isBlockOccupied(parseInt(o.value)) ? '(Ocupado)' : ''}
                </option>
              ))}
            </select>
            {errors.startBlock && <span className="text-red-500 text-sm">{errors.startBlock.message as string}</span>}
            {startBlock && (
              <p className="text-xs text-gray-500 mt-1">
                Horario: {timeRange.start} - {timeRange.end}
              </p>
            )}
          </div>

          {/* Receso toggle */}
          <div className="flex items-center mt-8">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRecess}
                onChange={handleRecessChange}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-gray-700 font-bold">{isRecess ? 'Receso' : 'No es receso'}</span>
            </label>
          </div>

          {/* Materia (dropdown oculto operativamente, pero mantenemos para compatibilidad) */}
          {!isRecess && (
            <div>
              <label htmlFor="subjectId" className="text-gray-700 font-bold mb-1 block">
                Materia *
              </label>
              <select
                id="subjectId"
                {...register('subjectId', { required: !isRecess ? 'La materia es requerida' : false })}
                className={`w-full px-3 py-2 border-2 border-solid rounded-md focus:outline-none focus:ring ${
                  errors.subjectId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loadingSubjects}
              >
                <option value="">Seleccione una materia</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
              {errors.subjectId && <span className="text-red-500 text-sm">{errors.subjectId.message as string}</span>}
            </div>
          )}

          {/* Docente */}
          <div>
            <label htmlFor="teacherId" className="text-gray-700 font-bold mb-1 block">
              Docente
            </label>
            <select
              id="teacherId"
              {...register('teacherId')}
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md focus:outline-none focus:ring"
              disabled={loadingTeachers || isRecess}
            >
              <option value="">Sin docente asignado</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
            {loadingTeachers && <span className="text-sm text-gray-500">Cargando docentes...</span>}
          </div>

          {/* Aula */}
          <div>
            <label htmlFor="classroom" className="text-gray-700 font-bold mb-1 block">
              Aula
            </label>
            <input
              id="classroom"
              type="text"
              {...register('classroom')}
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md"
              placeholder="Ej: A-101"
              disabled={isRecess}
            />
          </div>

          {/* Edificio */}
          <div>
            <label htmlFor="building" className="text-gray-700 font-bold mb-1 block">
              Edificio
            </label>
            <input
              id="building"
              type="text"
              {...register('building')}
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md"
              placeholder="Ej: Principal"
              disabled={isRecess}
            />
          </div>
        </div>

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