// src/privateViews/TeacherList/EditTeacherView.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { FormField } from '../../components/FormField';
import type { TypeTeacher } from '../../types/teacher';
import { getTeacherByIdAPI, updateTeacherAPI } from '../../apis/teacher';
import AnimatedPage from '../../components/AnimatedPage';

interface LocationState {
  teacherData?: TypeTeacher;
  teacherId?: string;
}

export default function EditTeacherView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [teacher, setTeacher] = useState<TypeTeacher | null>(null);

  const state = location.state as LocationState;
  const teacherId = state?.teacherId || state?.teacherData?.id;

  useEffect(() => {
    if (!teacherId) {
      toast.error('No se proporcionó ID del profesor');
      navigate('/admin/ListTeacher');
      return;
    }

    // Si ya tenemos los datos en el estado, los cargamos
    if (state?.teacherData) {
      setTeacher(state.teacherData);
      loadTeacherData(state.teacherData);
    } else {
      // Si no, los cargamos desde la API
      fetchTeacherData(teacherId);
    }
  }, [teacherId, navigate, state]);

  const fetchTeacherData = async (id: string) => {
    try {
      setIsFetching(true);
      const response = await getTeacherByIdAPI(id);
      
      if (response.result && response.content) {
        setTeacher(response.content);
        loadTeacherData(response.content);
      } else {
        toast.error('No se pudo cargar la información del profesor');
        navigate('/admin/ListTeacher');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos del profesor');
      navigate('/admin/ListTeacher');
    } finally {
      setIsFetching(false);
    }
  };

  const loadTeacherData = (teacherData: TypeTeacher) => {
    // Establecer los valores en el formulario
    setValue('id', teacherData.id);
    setValue('fullName', teacherData.fullName || '');
    setValue('identityCard', teacherData.identityCard || '');
    setValue('email', teacherData.email || '');
    setValue('phone', teacherData.phone || '');
    setValue('address', teacherData.address || '');
    setValue('specialization', teacherData.specialization || '');
    setValue('degree', teacherData.degree || '');
    setValue('status', teacherData.status ? 'true' : 'false');
    setValue('class', teacherData.class || '');
    setValue('comments', teacherData.comments || '');
  };

  const onSubmit = async (data: any) => {
    if (!teacherId) return;

    setIsLoading(true);
    try {
      const updateData = {
        id: teacherId,
        fullName: data.fullName,
        identityCard: data.identityCard,
        email: data.email,
        phone: data.phone,
        address: data.address,
        specialization: data.specialization || '',
        degree: data.degree || '',
        status: data.status === 'true' || data.status === true,
        class: data.class || '',
        comments: data.comments || ''
      };

      const response = await updateTeacherAPI(updateData);

      if (response.result) {
        toast.success('Profesor actualizado exitosamente');
        navigate('/admin/ListTeacher');
      } else {
        toast.error(response.error?.[0] || 'Error al actualizar profesor');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar profesor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/ListTeacher');
  };

  const handleClear = () => {
    if (teacher) {
      loadTeacherData(teacher);
      toast.info('Formulario restablecido a valores originales');
    }
  };

  if (isFetching) {
    return (
      <AnimatedPage>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando información del profesor...</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (!teacher) {
    return null;
  }

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <FaChalkboardTeacher className="mr-3 text-blue-600" />
            Editar Docente
          </h1>
          <p className="text-gray-600">
            Modifique los datos del docente {teacher.fullName}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            ID: {teacher.id} | Cédula: {teacher.identityCard}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register('id')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Personal */}
              <FormField
                id="fullName"
                label="Nombre Completo *"
                type="text"
                required={true}
                register={register}
                validation={{ required: "El nombre completo es requerido" }}
              />

              <FormField
                id="identityCard"
                label="Cédula de Identidad *"
                type="text"
                required={true}
                register={register}
                validation={{ required: "La cédula es requerida" }}
              />

              <FormField
                id="email"
                label="Email *"
                type="email"
                required={true}
                register={register}
                validation={{ 
                  required: "El email es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                }}
              />

              <FormField
                id="phone"
                label="Teléfono *"
                type="text"
                required={true}
                register={register}
                validation={{ required: "El teléfono es requerido" }}
              />

              <div className="md:col-span-2">
                <FormField
                  id="address"
                  label="Dirección *"
                  type="text"
                  required={true}
                  register={register}
                  validation={{ required: "La dirección es requerida" }}
                />
              </div>

              {/* Información Profesional */}
              <FormField
                id="specialization"
                label="Especialización"
                type="text"
                required={false}
                register={register}
              />

              <FormField
                id="degree"
                label="Título/Grado"
                type="text"
                required={false}
                register={register}
              />

              {/* Estado */}
              <FormField
                id="status"
                label="Estado"
                type="boolean"
                required={false}
                register={register}
              />

              <FormField
                id="class"
                label="Clase/Grupo"
                type="text"
                required={false}
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

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border-2 border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-2 border-2 border-gray-500 text-gray-500 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Actualizando...' : 'Actualizar Docente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AnimatedPage>
  );
}