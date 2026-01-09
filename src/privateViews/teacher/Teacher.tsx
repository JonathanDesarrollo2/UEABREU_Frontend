// src/views/teacher/InsertTeacher.tsx (actualización menor)
import { useNavigate } from "react-router-dom";
import { ActionButtons } from "../../components/ActionButtons";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import { FormField } from "../../components/FormField";
import { useCallback, useState } from 'react';
import type { TypeTeacherCreate } from "../../types/teacher";
import { toast } from "react-toastify";
import { FaChalkboardTeacher } from 'react-icons/fa';
import AnimatedPage from "../../components/AnimatedPage";
import Spinner from "../../layouts/components/spinnerGeneral";
import { useTeacherFormCreate } from "../../hooks/teacher/useTeacherForm";
import { useAddTeacher } from "../../hooks/teacher/useAddTeacher";

export default function InsertTeacher() {
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);
  const { register, handleSubmit, reset, formState: { errors } } = useTeacherFormCreate();
  const { mutate, reset: resetMutation, isPending } = useAddTeacher();

  const onSubmit = useCallback(
    (formdata: TypeTeacherCreate) => {
      // Validación manual adicional
      if (!formdata.fullName.trim()) {
        toast.error("El nombre completo es requerido");
        return;
      }
      if (!formdata.identityCard.trim()) {
        toast.error("La cédula es requerida");
        return;
      }
      if (!formdata.email.trim()) {
        toast.error("El email es requerido");
        return;
      }
      if (!formdata.phone.trim()) {
        toast.error("El teléfono es requerido");
        return;
      }
      if (!formdata.address.trim()) {
        toast.error("La dirección es requerida");
        return;
      }

      mutate(formdata, {
        onSuccess: (dataAPI) => {
          if (dataAPI.result) {
            const teacherId = dataAPI.content?.teacherId;
            toast.success(dataAPI.content?.message || "Docente creado exitosamente");
            reset();
            resetMutation();
            setFormKey((prev) => prev + 1);
            
            // Redirigir a la vista del docente recién creado si hay ID
            if (teacherId) {
              setTimeout(() => {
                navigate(`/system/teachers/view/${teacherId}`);
              }, 1500);
            }
          }
        },
      });
    },
    [mutate, reset, resetMutation, navigate]
  );

  const handleCancel = useCallback(() => navigate('/system/teachers'), [navigate]);
  const handleClear = useCallback(() => {
    reset();
    setFormKey(prev => prev + 1); 
    toast.info("Formulario limpiado");
  }, [reset]);

  return (
    <>
      {isPending && (
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
              Registrar Nuevo Docente
            </h2>
          </div>

          {/* Botones de Acción */}
          <ActionButtons onCancel={handleCancel} onClear={handleClear} />

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
                  defaultValue={true}
                />
              </div>
            </div>
          </CollapsibleSection>
        </form>
      </AnimatedPage>
    </>
  );
}