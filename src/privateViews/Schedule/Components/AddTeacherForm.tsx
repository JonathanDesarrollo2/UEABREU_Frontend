import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { addTeacherAPI, updateTeacherAPI } from '../../../apis/teacher';
import { FormField } from '../../../components/FormField';
import { useState, useEffect } from 'react';

const ambienteOptions = [
  { value: 'ordinario', text: 'Ordinario' },
  { value: 'contratado', text: 'Contratado' },
  { value: 'temporal', text: 'Temporal' },
  { value: 'suplente', text: 'Suplente' },
  { value: 'pasante', text: 'Pasante' },
];

interface AddTeacherFormProps {
  teacherData?: any;
  onSuccess?: () => void;
}

export default function AddTeacherForm({ teacherData, onSuccess }: AddTeacherFormProps = {}) {
  const isEditing = !!teacherData;

  const defaultValues = teacherData
    ? {
        fullName: teacherData.fullName || '',
        identityCard: teacherData.identityCard || '',
        email: teacherData.email || '',
        phone: teacherData.phone || '',
        address: teacherData.address || '',
        degree: teacherData.degree || '',
        specialization: teacherData.specialization || '',
        status: String(teacherData.status ?? true),
        class: teacherData.class || '',
        comments: teacherData.comments || '',
      }
    : {
        fullName: '',
        identityCard: '',
        email: '',
        phone: '',
        address: '',
        degree: '',
        specialization: '',
        status: 'true',
        class: '',
        comments: '',
      };

  const { register, handleSubmit, reset } = useForm({ defaultValues });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (teacherData) {
      reset({
        fullName: teacherData.fullName || '',
        identityCard: teacherData.identityCard || '',
        email: teacherData.email || '',
        phone: teacherData.phone || '',
        address: teacherData.address || '',
        degree: teacherData.degree || '',
        specialization: teacherData.specialization || '',
        status: String(teacherData.status ?? true),
        class: teacherData.class || '',
        comments: teacherData.comments || '',
      });
    }
  }, [teacherData, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        status: data.status === 'true' || data.status === true,
      };

      const response = isEditing
        ? await updateTeacherAPI({ id: teacherData.id, ...payload })
        : await addTeacherAPI(payload);

      if (response.result) {
        toast.success(isEditing ? 'Docente actualizado exitosamente' : 'Docente creado exitosamente');
        if (!isEditing) reset();
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.error?.[0] || 'Error al procesar docente');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar docente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Editar Docente' : 'Agregar Nuevo Docente'}
        </h2>
        <p className="text-gray-600">
          {isEditing ? 'Modifique los datos del docente' : 'Complete los datos del docente'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField id="fullName" label="Nombre Completo *" required register={register} />
          <FormField id="identityCard" label="Cédula de Identidad *" required register={register} />
          <FormField id="email" label="Email *" type="email" required register={register} />
          <FormField id="phone" label="Teléfono *" required register={register} />

          <div className="md:col-span-2">
            <FormField id="address" label="Dirección *" required register={register} />
          </div>

          <FormField id="degree" label="Título/Grado" register={register} />
          <FormField id="specialization" label="Especialización" register={register} />

          {/* Estado */}
          <div className="flex flex-col mb-2">
            <label htmlFor="status" className="text-gray-700 font-bold mb-1">Estado</label>
            <select
              id="status"
              {...register('status')}
              className="w-full px-3 py-2 border-2 border-solid border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          <FormField
            id="class"
            label="Ambiente"
            type="select"
            register={register}
            options={ambienteOptions}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Comentarios</label>
          <textarea
            {...register('comments')}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            rows={3}
            placeholder="Observaciones sobre el docente..."
          />
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {isLoading
              ? 'Guardando...'
              : isEditing
              ? 'Actualizar Docente'
              : 'Guardar Docente'}
          </button>
        </div>
      </form>
    </div>
  );
}