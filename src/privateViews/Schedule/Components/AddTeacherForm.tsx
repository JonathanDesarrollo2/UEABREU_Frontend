import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { addTeacherAPI } from '../../../apis/teacher';
import { FormField } from '../../../components/FormField';

export default function AddTeacherForm() {
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await addTeacherAPI({
        ...data,
        status: data.status === 'true' || data.status === true,
      });

      if (response.result) {
        toast.success('Docente creado exitosamente');
        reset();
      } else {
        toast.error(response.error?.[0] || 'Error al crear docente');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al crear docente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agregar Nuevo Docente</h2>
        <p className="text-gray-600">Complete los datos del docente</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <FormField
            id="fullName"
            label="Nombre Completo *"
            required
            register={register}
          />

          <FormField
            id="identityCard"
            label="Cédula de Identidad *"
            required
            register={register}
          />

          <FormField
            id="email"
            label="Email *"
            type="email"
            required
            register={register}
          />

          <FormField
            id="phone"
            label="Teléfono *"
            required
            register={register}
          />

          <div className="md:col-span-2">
            <FormField
              id="address"
              label="Dirección *"
              required
              register={register}
            />
          </div>

          {/* Información Profesional */}
          <FormField
            id="specialization"
            label="Especialización"
            register={register}
          />

          <FormField
            id="degree"
            label="Título/Grado"
            register={register}
          />

          <FormField
            type="boolean"
            id="status"
            label="Estado"
            register={register}
            defaultValue="true"
          />

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
            placeholder="Observaciones sobre el docente..."
          />
        </div>

        {/* Botón de envío */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {isLoading ? 'Guardando...' : 'Guardar Docente'}
          </button>
        </div>
      </form>
    </div>
  );
}