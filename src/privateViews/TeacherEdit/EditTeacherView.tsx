import { useNavigate, useLocation } from "react-router-dom";
import { ActionButtons } from "../../components/ActionButtons";
import { FormField } from "../../components/FormField";
import { useUpdateTeacher } from "./hooks/useUpdateTeacher";
import { useCallback, useEffect } from 'react';
import { toast } from "react-toastify";
import { FaChalkboardTeacher } from 'react-icons/fa';
import AnimatedPage from "../../components/AnimatedPage";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import SpinnerGeneral from "../../layouts/components/spinnerGeneral";
import { teacherUpdateSchema, type TypeTeacherUpdate } from "../../types/teacher";

export default function EditTeacherPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const teacherData = location.state?.teacherData as TypeTeacherUpdate;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TypeTeacherUpdate>({
    resolver: zodResolver(teacherUpdateSchema),
    mode: 'onChange',
    defaultValues: teacherData || {
      id: '',
      fullName: '',
      identityCard: '',
      address: '',
      phone: '',
      email: '',
      specialization: '',
      degree: '',
      status: true,
      comments: '',
      class: '',
    },
  });

  const { mutate, reset: resetMutation, isPending } = useUpdateTeacher();

  useEffect(() => {
    if (teacherData) {
      reset(teacherData);
    } else {
      toast.error("No se encontraron datos del profesor");
      navigate('/admin/teachers/list');
    }
  }, [teacherData, reset, navigate]);

  const onSubmit = useCallback(
    (formdata: TypeTeacherUpdate) => {
      if (!formdata.fullName?.trim()) return toast.error("El nombre completo es requerido");
      if (!formdata.identityCard?.trim()) return toast.error("La cédula es requerida");
      if (!formdata.email?.trim()) return toast.error("El email es requerido");
      if (!formdata.address?.trim()) return toast.error("La dirección es requerida");
      if (!formdata.phone?.trim()) return toast.error("El teléfono es requerido");

      mutate(formdata, {
        onSuccess: (dataAPI) => {
          if (dataAPI.result) {
            resetMutation();
            toast.success("Profesor actualizado exitosamente");
            navigate('/admin/teachers/list');
          }
        },
        onError: (error: Error) => {
          toast.error(error.message || "Error al actualizar profesor");
        }
      });
    },
    [mutate, resetMutation, navigate]
  );

  const handleCancel = useCallback(() => navigate('/admin/teachers/list'), [navigate]);

  const handleClear = useCallback(() => {
    reset(teacherData);
    toast.info("Formulario restablecido");
  }, [reset, teacherData]);

  if (!teacherData) return null;

  return (
    <>
      {isPending && <SpinnerGeneral />}
      <AnimatedPage className="flex justify-center">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
              <FaChalkboardTeacher className="mr-3" />
              Editar Profesor
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Actualice los datos del profesor. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
            </p>
          </div>

          <ActionButtons onCancel={handleCancel} onClear={handleClear} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Información Personal */}
            <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField
                      id="fullName"
                      label="Nombre Completo *"
                      required={true}
                      register={register}
                      error={errors.fullName}
                      defaultValue={teacherData.fullName}
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField
                      id="identityCard"
                      label="Cédula de Identidad *"
                      required={true}
                      register={register}
                      error={errors.identityCard}
                      defaultValue={teacherData.identityCard}
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField
                      id="email"
                      label="Email *"
                      required={true}
                      register={register}
                      error={errors.email}
                      type="email"
                      defaultValue={teacherData.email}
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField
                      id="phone"
                      label="Teléfono *"
                      required={true}
                      register={register}
                      error={errors.phone}
                      defaultValue={teacherData.phone}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-center">
                  <div className="w-full max-w-2xl">
                    <FormField
                      id="address"
                      label="Dirección *"
                      required={true}
                      register={register}
                      error={errors.address}
                      defaultValue={teacherData.address}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información Profesional */}
            <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
                Información Profesional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField
                      id="specialization"
                      label="Especialización"
                      register={register}
                      error={errors.specialization}
                      defaultValue={teacherData.specialization}
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField
                      id="degree"
                      label="Título Académico"
                      register={register}
                      error={errors.degree}
                      defaultValue={teacherData.degree}
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField
                      type="boolean"
                      id="status"
                      label="Estado *"
                      required={true}
                      register={register}
                      error={errors.status}
                      defaultValue={teacherData.status}
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField
                      id="class"
                      label="Clase/Grupo"
                      register={register}
                      error={errors.class}
                      defaultValue={teacherData.class}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
                Información Adicional
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl">
                    <div className="flex flex-col">
                      <label className="text-gray-700 font-bold mb-1">Comentarios</label>
                      <textarea
                        {...register('comments')}
                        defaultValue={teacherData.comments}
                        className={`w-full px-3 py-2 border-2 border-solid ${
                          errors.comments ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
                        rows={4}
                        placeholder="Notas adicionales sobre el profesor..."
                      />
                      {errors.comments && (
                        <span className="text-red-500 text-sm mt-1">{errors.comments.message}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="px-10 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                {isPending ? 'Actualizando...' : 'Actualizar Profesor'}
              </button>
            </div>
          </form>
        </div>
      </AnimatedPage>
    </>
  );
}