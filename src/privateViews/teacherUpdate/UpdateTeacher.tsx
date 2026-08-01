// src/views/teacher/EditTeacher.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { TypeTeacher, TypeTeacherUpdate } from "../../types/teacher";
import { ActionButtons } from "../../components/ActionButtons";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import { FormField } from "../../components/FormField";
import AnimatedPage from "../../components/AnimatedPage";
import Spinner from "../../layouts/components/spinnerGeneral";
import { toast } from "react-toastify";
import { FaChalkboardTeacher } from 'react-icons/fa';
import { useGetTeacherById } from "../../hooks/teacher/useGetTeacherById";
import { useUpdateTeacher } from "../../hooks/teacher/useUpdateTeacher";
import { useTeacherFormUpdate } from "../../hooks/teacher/useTeacherForm";

export default function EditTeacher() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetTeacherById(id || '', !!id);
  const { mutate: updateTeacher, isPending: isUpdating } = useUpdateTeacher();
  const [formKey, setFormKey] = useState(0);

  const teacher = data?.content;
  
  // Crear un objeto de valores iniciales que coincida con TypeTeacherUpdate
  const getInitialValues = (teacherData?: TypeTeacher): Partial<TypeTeacherUpdate> => {
    if (!teacherData) return { id: id || '' };
    
    return {
      id: teacherData.id,
      fullName: teacherData.fullName,
      identityCard: teacherData.identityCard,
      address: teacherData.address,
      phone: teacherData.phone,
      email: teacherData.email,
      specialization: teacherData.specialization || '',
      degree: teacherData.degree || '',
      status: teacherData.status,
      comments: teacherData.comments || '',
      class: teacherData.class || '',
    };
  };

  const { register, handleSubmit, reset, formState: { errors } } = useTeacherFormUpdate(
    getInitialValues(teacher)
  );

  useEffect(() => {
    if (teacher) {
      reset(getInitialValues(teacher));
      setFormKey(prev => prev + 1);
    }
  }, [teacher, reset]);

  const onSubmit = (formData: TypeTeacherUpdate) => {
    if (!id) {
      toast.error("ID del docente no válido");
      return;
    }

    // Asegurar que el ID esté incluido
    const dataToSend = { ...formData, id };
    
    updateTeacher(dataToSend, {
      onSuccess: (dataAPI) => {
        if (dataAPI.result) {
          toast.success(dataAPI.content[0] || "Docente actualizado exitosamente");
          navigate(`/system/teachers/view/${id}`);
        } else {
          toast.error(dataAPI.error[0] || "Error al actualizar");
        }
      },
      onError: (error) => {
        toast.error(error.message || "Error al actualizar docente");
      }
    });
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/system/teachers/view/${id}`);
    } else {
      navigate('/system/teachers');
    }
  };

  const handleClear = () => {
    if (teacher) {
      reset(getInitialValues(teacher));
      setFormKey(prev => prev + 1);
      toast.info("Cambios descartados");
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!teacher && !isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Docente no encontrado
        </div>
        <button
          onClick={() => navigate('/system/teachers')}
          className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <>
      {isUpdating && (
        <Spinner />
      )}
      <AnimatedPage>
        <form 
          key={formKey}
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1"
        >
          {/* Título principal */}
          <div className="col-span-1">
            <h2 className="text-2xl text-center font-bold text-gray-800 mb-2">
              <FaChalkboardTeacher className="mr-4 inline-block" />
              Editar Docente
            </h2>
            <p className="text-center text-gray-600 mb-6">
              {teacher?.fullName} - {teacher?.identityCard}
            </p>
          </div>

          {/* Botones de Acción */}
          <ActionButtons onCancel={handleCancel} onClear={handleClear} />

          {/* Campo ID oculto */}
          <input type="hidden" {...register("id")} />

          {/* Sección: Información Personal */}
          <CollapsibleSection title="Información Personal">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
              <FormField 
                id="fullName" 
                label="Nombre Completo" 
                required={true} 
                register={register} 
                error={errors.fullName} 
              />
              <FormField 
                id="identityCard" 
                label="Cédula de Identidad" 
                required={true} 
                register={register} 
                error={errors.identityCard} 
              />
              <FormField 
                id="email" 
                label="Email" 
                required={true} 
                register={register} 
                error={errors.email} 
                type="email"
              />
              <FormField 
                id="phone" 
                label="Teléfono" 
                required={true} 
                register={register} 
                error={errors.phone} 
              />
              <div className="lg:col-span-2">
                <FormField 
                  id="address" 
                  label="Dirección" 
                  required={true} 
                  register={register} 
                  error={errors.address} 
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Sección: Información Profesional */}
          <CollapsibleSection title="Información Profesional">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
              <FormField 
                id="specialization" 
                label="Especialización" 
                register={register} 
                error={errors.specialization} 
              />
              <FormField 
                id="degree" 
                label="Título Académico" 
                register={register} 
                error={errors.degree} 
              />
              <FormField 
                id="class" 
                label="Clase (Grupo Administrativo)" 
                register={register} 
                error={errors.class} 
              />
              <div className="lg:col-span-2">
                <FormField 
                  id="comments" 
                  label="Comentarios" 
                  register={register} 
                  error={errors.comments} 
                />
              </div>
              <div className="lg:col-span-2">
                <FormField 
                  type="boolean"
                  id="status" 
                  label="Estado" 
                  required={true} 
                  register={register} 
                  error={errors.status}
                  defaultValue={teacher?.status}
                />
              </div>
            </div>
          </CollapsibleSection>
        </form>
      </AnimatedPage>
    </>
  );
}