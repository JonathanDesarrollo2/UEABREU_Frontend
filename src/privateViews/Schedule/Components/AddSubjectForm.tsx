import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getActiveTeachersAPI } from '../../../apis/teacher';
import { addSubjectAPI } from '../../../apis/schedule';
import { FormField } from '../../../components/FormField';

const SUBJECT_TYPE_OPTIONS = [
  { value: 'ordinaria', text: 'Ordinaria' },
  { value: 'regular', text: 'Regular' },
  { value: 'complementaria_obligatoria', text: 'Complementaria Obligatoria' },
  { value: 'complementaria_opcional', text: 'Complementaria Opcional' },
];

export default function AddSubjectForm() {
  const { register, handleSubmit, reset } = useForm();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar docentes al montar - CORREGIDO
  useEffect(() => {
    getActiveTeachersAPI()
      .then(response => {
        if (response.result && response.content) {
          setTeachers(response.content);
        } else {
          toast.error('No se pudieron cargar los docentes');
        }
      })
      .catch((error) => {
        console.error('Error cargando docentes:', error);
        toast.error('Error al cargar docentes');
      });
  }, []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await addSubjectAPI({
        ...data,
        hoursPerWeek: parseInt(data.hoursPerWeek) || 0,
        theoreticalHours: parseInt(data.theoreticalHours) || 0,
        labHours: parseInt(data.labHours) || 0,
      });

      if (response.result) {
        toast.success('Materia creada exitosamente');
        reset();
      } else {
        toast.error(response.error?.[0] || 'Error al crear materia');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al crear materia');
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
          {/* Nombre y Código */}
          <FormField
            id="name"
            label="Nombre de la Materia *"
            required
            register={register}
          />

          <FormField
            id="code"
            label="Código (ej: 1ro.Biologia) *"
            required
            register={register}
          />

          {/* Horas */}
          <FormField
            type="number"
            id="hoursPerWeek"
            label="Horas por Semana *"
            required
            register={register}
            defaultValue="0"
          />

          <FormField
            type="number"
            id="theoreticalHours"
            label="Horas Teóricas"
            register={register}
            defaultValue="0"
          />

          <FormField
            type="number"
            id="labHours"
            label="Horas de Laboratorio"
            register={register}
            defaultValue="0"
          />

          {/* Tipo de Materia */}
          <FormField
            type="select"
            id="subjectType"
            label="Tipo de Materia"
            register={register}
            options={SUBJECT_TYPE_OPTIONS}
          />

          {/* Docente - CORREGIDO */}
          <div className="flex flex-col mb-2">
            <label htmlFor="teacherId" className="text-gray-700 font-bold mb-1">
              Docente Asignado
            </label>
            <select
              id="teacherId"
              {...register('teacherId')}
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="">Sin docente asignado</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Clase y Comentarios */}
          <FormField
            id="class"
            label="Clase/Grupo"
            register={register}
          />
        </div>

        {/* Comentarios */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Comentarios
          </label>
          <textarea
            {...register('comments')}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            rows={3}
            placeholder="Observaciones sobre la materia..."
          />
        </div>

        {/* Botón de envío */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {isLoading ? 'Guardando...' : 'Guardar Materia'}
          </button>
        </div>
      </form>
    </div>
  );
}