import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getActiveTeachersAPI } from '../../../apis/teacher';
import { addSubjectAPI } from '../../../apis/schedule';

// Opciones para el tipo de materia (ahora PLAN DE ESTUDIO)
const SUBJECT_TYPE_OPTIONS = [
  { value: 'ordinaria', text: 'Ordinaria' },
  { value: 'regular', text: 'Regular' },
  { value: 'complementaria_obligatoria', text: 'Complementaria Obligatoria' },
  { value: 'complementaria_opcional', text: 'Complementaria Opcional' },
];

export default function AddSubjectForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

  // Cargar docentes al montar - CORREGIDO
  useEffect(() => {
    setIsLoadingTeachers(true);
    getActiveTeachersAPI()
      .then(response => {
        if (response.result && response.content) {
          setTeachers(response.content);
          console.log('Docentes cargados:', response.content);
        } else {
          console.warn('No se pudieron cargar los docentes:', response.error);
          toast.error('No se encontraron docentes activos');
        }
      })
      .catch((error) => {
        console.error('Error cargando docentes:', error);
        toast.error('Error al cargar docentes. Por favor, intente nuevamente.');
      })
      .finally(() => {
        setIsLoadingTeachers(false);
      });
  }, []);

  const onSubmit = async (data: any) => {
    console.log('Datos del formulario:', data);
    
    setIsLoading(true);
    try {
      // Preparar los datos correctamente
      const formData = {
        name: data.name?.trim() || '',
        code: data.code?.trim() || '',
        hoursPerWeek: parseInt(data.hoursPerWeek) || 0,
        theoreticalHours: parseInt(data.theoreticalHours) || 0,
        labHours: parseInt(data.labHours) || 0,
        subjectType: data.subjectType || 'regular',
        teacherId: data.teacherId || null, // Enviar null si está vacío
        class: data.class?.trim() || '',
        comments: data.comments?.trim() || '',
      };

      console.log('Datos a enviar:', formData);

      const response = await addSubjectAPI(formData);

      if (response.result) {
        toast.success('Materia creada exitosamente');
        reset();
      } else {
        console.error('Error del backend:', response.error);
        const errorMessage = response.error?.[0] || 'Error al crear materia';
        
        // Mensajes más específicos según el error
        if (errorMessage.includes('código')) {
          toast.error('El código de materia ya existe o es inválido');
        } else if (errorMessage.includes('docente')) {
          toast.error('El docente seleccionado no existe o no está activo');
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Error en la petición:', error);
      toast.error(error.message || 'Error de conexión al servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agregar Nueva Materia</h2>
        <p className="text-gray-600">Complete los datos de la materia</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre de la Materia */}
          <div className="flex flex-col">
            <label htmlFor="name" className="text-gray-700 font-bold mb-1">
              Nombre de la Materia *
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { 
                required: 'El nombre es requerido',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' }
              })}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
              placeholder="Ej: Matemáticas"
            />
            {errors.name && (
              <span className="text-red-500 text-sm mt-1">{errors.name.message as string}</span>
            )}
          </div>

          {/* Código */}
          <div className="flex flex-col">
            <label htmlFor="code" className="text-gray-700 font-bold mb-1">
              Código (ej: 1ro.matematica) *
            </label>
            <input
              id="code"
              type="text"
              {...register('code', { 
                required: 'El código es requerido',
                pattern: {
                  value: /^[1-6](ro|do|to|to)\.\w+$/i,
                  message: 'Formato: Grado.Nombre (ej: 1ro.matematica)'
                }
              })}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.code ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
              placeholder="1ro.matematica"
            />
            {errors.code && (
              <span className="text-red-500 text-sm mt-1">{errors.code.message as string}</span>
            )}
          </div>

          {/* Horas por Semana */}
          <div className="flex flex-col">
            <label htmlFor="hoursPerWeek" className="text-gray-700 font-bold mb-1">
              Horas por Semana *
            </label>
            <input
              id="hoursPerWeek"
              type="number"
              min="0"
              max="20"
              defaultValue="4"
              {...register('hoursPerWeek', { 
                required: 'Horas por semana requeridas',
                min: { value: 0, message: 'Mínimo 0 horas' },
                max: { value: 20, message: 'Máximo 20 horas' }
              })}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.hoursPerWeek ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
            />
            {errors.hoursPerWeek && (
              <span className="text-red-500 text-sm mt-1">{errors.hoursPerWeek.message as string}</span>
            )}
          </div>

          {/* Horas Teóricas */}
          <div className="flex flex-col">
            <label htmlFor="theoreticalHours" className="text-gray-700 font-bold mb-1">
              Horas Teóricas
            </label>
            <input
              id="theoreticalHours"
              type="number"
              min="0"
              max="20"
              defaultValue="2"
              {...register('theoreticalHours', { 
                min: { value: 0, message: 'Mínimo 0 horas' },
                max: { value: 20, message: 'Máximo 20 horas' }
              })}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.theoreticalHours ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
            />
            {errors.theoreticalHours && (
              <span className="text-red-500 text-sm mt-1">{errors.theoreticalHours.message as string}</span>
            )}
          </div>

          {/* Horas Prácticas (antes Horas de Laboratorio) */}
          <div className="flex flex-col">
            <label htmlFor="labHours" className="text-gray-700 font-bold mb-1">
              Horas Prácticas
            </label>
            <input
              id="labHours"
              type="number"
              min="0"
              max="20"
              defaultValue="2"
              {...register('labHours', { 
                min: { value: 0, message: 'Mínimo 0 horas' },
                max: { value: 20, message: 'Máximo 20 horas' }
              })}
              className={`w-full px-3 py-2 border-2 border-solid ${
                errors.labHours ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
            />
            {errors.labHours && (
              <span className="text-red-500 text-sm mt-1">{errors.labHours.message as string}</span>
            )}
          </div>

          {/* Plan de Estudio (antes Tipo de Materia) */}
          <div className="flex flex-col">
            <label htmlFor="subjectType" className="text-gray-700 font-bold mb-1">
              Plan de Estudio
            </label>
            <select
              id="subjectType"
              {...register('subjectType')}
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              defaultValue="regular"
            >
              {SUBJECT_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.text}
                </option>
              ))}
            </select>
          </div>

          {/* Docente Asignado */}
          <div className="flex flex-col">
            <label htmlFor="teacherId" className="text-gray-700 font-bold mb-1">
              Docente Asignado
            </label>
            <select
              id="teacherId"
              {...register('teacherId')}
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              disabled={isLoadingTeachers}
            >
              <option value="">Sin docente asignado</option>
              {isLoadingTeachers ? (
                <option value="" disabled>Cargando docentes...</option>
              ) : (
                teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName} {teacher.specialization ? `(${teacher.specialization})` : ''}
                  </option>
                ))
              )}
            </select>
            {isLoadingTeachers && (
              <span className="text-blue-500 text-sm mt-1">Cargando lista de docentes...</span>
            )}
          </div>

          {/* Ambiente (antes Clase/Grupo) */}
          <div className="flex flex-col">
            <label htmlFor="class" className="text-gray-700 font-bold mb-1">
              Ambiente
            </label>
            <input
              id="class"
              type="text"
              {...register('class')}
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Ej: A-101, Laboratorio 1, etc."
            />
          </div>
        </div>

        {/* Comentarios */}
        <div className="flex flex-col">
          <label htmlFor="comments" className="text-gray-700 font-bold mb-2">
            Comentarios (Opcional)
          </label>
          <textarea
            id="comments"
            {...register('comments')}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            rows={3}
            placeholder="Observaciones sobre la materia..."
          />
        </div>

        {/* Información de ayuda */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📝 Notas importantes:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• El código debe seguir el formato: <strong>Grado.NombreMateria</strong></li>
            <li>• Ejemplos válidos: <code>1ro.matematica</code>, <code>2do.ciencias</code></li>
            <li>• Las horas totales por semana se calculan automáticamente</li>
            <li>• El docente es opcional y puede asignarse después</li>
          </ul>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Materia'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}