import { useNavigate } from "react-router-dom";
import { ActionButtons } from "../../components/ActionButtons";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import { FormField } from "../../components/FormField";
import { useAddUser } from "./hook/useAddUser";
import { useUserForm } from "./hook/useUserForm";
import { useCallback, useState } from 'react';
import type { TypeLogin_insert } from "../../types/login";
import { toast } from "react-toastify";
import { FaUserPlus } from 'react-icons/fa';
import AnimatedPage from "../../components/AnimatedPage";
import Spinner from "../../layouts/components/spinnerGeneral";

export default function InsertUser() {
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);
  const { register, handleSubmit, reset, formState: { errors } } = useUserForm();
  const { mutate, reset: resetMutation, isPending } = useAddUser();

  // Función para enviar el formulario
  const onSubmit = useCallback(
    (formdata: TypeLogin_insert) => {
      // Validación manual de campos vacíos
      if (!formdata.usermail?.trim()) {
        toast.error("El email es requerido");
        return;
      }
      if (!formdata.userlogin?.trim()) {
        toast.error("El Nombre de Usuario es requerido.");
        return;
      }
      if (!formdata.userpass?.trim()) {
        toast.error("La contraseña es requerida.");
        return;
      }
      if (!formdata.userrepass?.trim()) {
        toast.error("La confirmación contraseña es requerida.");
        return;
      }
      if (formdata.userpass?.trim() !== formdata.userrepass?.trim()) {
        toast.error("Las contraseñas y Confirmación, no coinciden. ");
        return;
      }
  
      mutate(formdata, {
        onSuccess: (dataAPI) => {
          if (dataAPI.result) {
            reset();
            resetMutation();
            setFormKey((prev) => prev + 1);
          }
        },
      });
    },
    [mutate, reset, resetMutation]
  );

  // Función para cancelar
  const handleCancel = useCallback(() => navigate('/system'), [navigate]);

  // Función para Limpiar
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
                <FaUserPlus className="mr-4 inline-block" />
                Registrar Usuarios del Sistema
              </h2>
            </div>

            {/* Botones de Acción */}
            <ActionButtons onCancel={handleCancel} onClear={handleClear} />

            {/* Sección: Datos Principales */}
            <CollapsibleSection title="Datos Principales">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
                <FormField 
                  id="usermail" 
                  label="Email del Usuario" 
                  required={true} 
                  register={register} 
                  error={errors.usermail} 
                  type="email"
                />
                <FormField 
                  id="userlogin" 
                  label="ID. del Usuario" 
                  required={true} 
                  register={register} 
                  error={errors.userlogin} 
                />
                <FormField 
                  id="username" 
                  label="Nombre del Usuario" 
                  register={register} 
                  error={errors.username} 
                />
                <FormField 
                    type="password"
                    id="userpass" 
                    label="Contraseña del Usuario" 
                    required={true} 
                    register={register} 
                    error={errors.userpass} 
                />
                <FormField 
                    type="password"
                    id="userrepass" 
                    label="Confirmar Contraseña" 
                    required={true} 
                    register={register} 
                    error={errors.userrepass} 
                />
                <FormField 
                  type="select" // ✅ Cambiado de "number" a "select"
                  id="nivel" 
                  label="Nivel de Acceso" 
                  required={true} 
                  register={register} 
                  error={errors.nivel}
                  defaultValue="1" // ✅ Mantén como string (será convertido por setValueAs)
                  options={[
                    { value: "1", text: "Representante" },
                    { value: "2", text: "Administrador" }
                  ]}
                />
                <div className="lg:col-span-2">
                  <FormField 
                    type="checkbox"
                    id="userstatus" 
                    label="Usuario Activo" 
                    register={register} 
                  />
                </div>
              </div>
            </CollapsibleSection>
          </form>
        </AnimatedPage>
    </>
  );
}