import { useNavigate } from "react-router-dom";
import { ActionButtons } from "../../components/ActionButtons";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import { FormField } from "../../components/FormField";
import { useAddUser } from "./hook/useAddUser";
import { useCallback, useState, useEffect } from 'react';
import { loginInsertSchema, type TypeLogin_insert } from "../../types/login";
import { toast } from "react-toastify";
import { FaUserPlus, FaMoneyBillWave } from 'react-icons/fa';
import AnimatedPage from "../../components/AnimatedPage";
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import SpinnerGeneral from "../../layouts/components/spinnerGeneral";

// Tipo local extendido para el formulario
type ExtendedUserInsert = TypeLogin_insert & {
  representativeData?: {
    fullName: string;
    identityCard: string;
    address: string;
    phone: string;
    relationship: string;
    parentName?: string;
    parentIdentityCard?: string;
    parentAddress?: string;
    parentPhone?: string;
    initialBalance?: number;
  };
  studentsData?: Array<{
    fullName: string;
    identityCard: string;
    birthDate: string;
    state: string;
    zone: string;
    addressDescription: string;
    phone?: string;
    nationality: string;
    birthCountry: string;
    hasAllergies: boolean;
    allergiesDescription?: string;
    hasDiseases: boolean;
    diseasesDescription?: string;
    emergencyContact: string;
    emergencyPhone: string;
  }>;
};

// Hook para el formulario extendido
const useInsertUserForm = () => {
  return useForm<ExtendedUserInsert>({
    resolver: zodResolver(loginInsertSchema),
    mode: 'onChange',
    defaultValues: {
      usermail: '',
      userlogin: '',
      username: '',
      userpass: '',
      userrepass: '',
      nivel: 1,
      userstatus: true,
    },
  });
};

// Componente para datos del representante
const RepresentativeForm = ({ register, errors }: any) => {
  return (
    <CollapsibleSection title="Datos del Representante">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
        <FormField 
          id="representativeData.fullName" 
          label="Nombre Completo" 
          required={true} 
          register={register} 
          error={errors?.representativeData?.fullName} 
        />
        <FormField 
          id="representativeData.identityCard" 
          label="Cédula de Identidad" 
          required={true} 
          register={register} 
          error={errors?.representativeData?.identityCard} 
        />
        <FormField 
          id="representativeData.address" 
          label="Dirección" 
          required={true} 
          register={register} 
          error={errors?.representativeData?.address} 
        />
        <FormField 
          id="representativeData.phone" 
          label="Teléfono" 
          required={true} 
          register={register} 
          error={errors?.representativeData?.phone} 
        />
        <FormField 
          id="representativeData.relationship" 
          label="Relación con el Estudiante" 
          required={true} 
          register={register} 
          error={errors?.representativeData?.relationship} 
        />
        <FormField 
          type="number"
          id="representativeData.initialBalance" 
          label="Saldo Inicial" 
          register={register} 
          error={errors?.representativeData?.initialBalance} 
          validation={{
            valueAsNumber: true,
            validate: (value) => !isNaN(value) || "Debe ser un número válido"
          }}
        />
      </div>
    </CollapsibleSection>
  );
};

// Componente para estudiantes
const StudentsForm = ({ control, register, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "studentsData"
  });

  const addStudent = () => {
    append({
      fullName: '',
      identityCard: '',
      birthDate: '',
      state: '',
      zone: '',
      addressDescription: '',
      phone: '',
      nationality: '',
      birthCountry: '',
      hasAllergies: false,
      allergiesDescription: '',
      hasDiseases: false,
      diseasesDescription: '',
      emergencyContact: '',
      emergencyPhone: ''
    });
  };

  return (
    <CollapsibleSection title="Estudiantes">
      <div className="mb-6">
        <button
          type="button"
          onClick={addStudent}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="mr-2">+</span>
          Agregar Estudiante
        </button>
        <p className="text-sm text-gray-500 mt-2">
          {fields.length} estudiante(s) agregado(s)
        </p>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">
              Estudiante #{index + 1}
            </h4>
            <button
              type="button"
              onClick={() => remove(index)}
              className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              <span className="mr-1">🗑</span>
              Eliminar
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField 
              id={`studentsData.${index}.fullName`} 
              label="Nombre Completo" 
              required={true} 
              register={register} 
              error={errors?.studentsData?.[index]?.fullName} 
            />
            <FormField 
              id={`studentsData.${index}.identityCard`} 
              label="Cédula de Identidad" 
              required={true} 
              register={register} 
              error={errors?.studentsData?.[index]?.identityCard} 
            />
            <FormField 
              type="date"
              id={`studentsData.${index}.birthDate`} 
              label="Fecha de Nacimiento" 
              required={true} 
              register={register} 
              error={errors?.studentsData?.[index]?.birthDate} 
            />
            <FormField 
              id={`studentsData.${index}.nationality`} 
              label="Nacionalidad" 
              required={true} 
              register={register} 
              error={errors?.studentsData?.[index]?.nationality} 
            />
            <FormField 
              id={`studentsData.${index}.birthCountry`} 
              label="País de Nacimiento" 
              required={true} 
              register={register} 
              error={errors?.studentsData?.[index]?.birthCountry} 
            />
            <FormField 
              id={`studentsData.${index}.state`} 
              label="Estado" 
              required={true} 
              register={register} 
              error={errors?.studentsData?.[index]?.state} 
            />
            <FormField 
              id={`studentsData.${index}.zone`} 
              label="Zona" 
              required={true} 
              register={register} 
              error={errors?.studentsData?.[index]?.zone} 
            />
            
            {/* Address Description como textarea manual */}
            <div className="md:col-span-2">
              <div className="flex flex-col mb-2">
                <label className="text-gray-700 font-bold mb-1">
                  Descripción de la Dirección *
                </label>
                <textarea
                  {...register(`studentsData.${index}.addressDescription`, {
                    required: "Este campo es requerido"
                  })}
                  className={`w-full px-3 py-2 border-2 border-solid ${
                    errors?.studentsData?.[index]?.addressDescription ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring focus:border-blue-300`}
                  rows={3}
                />
                {errors?.studentsData?.[index]?.addressDescription && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.studentsData[index]?.addressDescription?.message}
                  </span>
                )}
              </div>
            </div>
            
            <FormField 
              id={`studentsData.${index}.phone`} 
              label="Teléfono" 
              register={register} 
              error={errors?.studentsData?.[index]?.phone} 
            />
            
            {/* Checkboxes y textareas manuales */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`studentsData.${index}.hasAllergies`}
                      {...register(`studentsData.${index}.hasAllergies`)}
                      className="h-5 w-5 mr-2"
                    />
                    <label htmlFor={`studentsData.${index}.hasAllergies`}>
                      ¿Tiene Alergias?
                    </label>
                  </div>
                  <textarea
                    {...register(`studentsData.${index}.allergiesDescription`)}
                    placeholder="Descripción de alergias"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`studentsData.${index}.hasDiseases`}
                      {...register(`studentsData.${index}.hasDiseases`)}
                      className="h-5 w-5 mr-2"
                    />
                    <label htmlFor={`studentsData.${index}.hasDiseases`}>
                      ¿Tiene Enfermedades?
                    </label>
                  </div>
                  <textarea
                    {...register(`studentsData.${index}.diseasesDescription`)}
                    placeholder="Descripción de enfermedades"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            
            <FormField 
              id={`studentsData.${index}.emergencyContact`} 
              label="Contacto de Emergencia" 
              required={true} 
              register={register} 
              error={errors?.studentsData?.[index]?.emergencyContact} 
            />
            <FormField 
              id={`studentsData.${index}.emergencyPhone`} 
              label="Teléfono de Emergencia" 
              required={true} 
              register={register} 
              error={errors?.studentsData?.[index]?.emergencyPhone} 
            />
          </div>
        </div>
      ))}
    </CollapsibleSection>
  );
};

export default function InsertUser() {
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);
  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useInsertUserForm();
  const { mutate, reset: resetMutation, isPending } = useAddUser();

  // Observar el valor del campo nivel
  const nivel = watch('nivel');
  const isRepresentative = nivel === 1;

  // Cuando cambie el nivel, limpiar datos de representante si no es nivel 1
  useEffect(() => {
    if (!isRepresentative) {
      setValue('representativeData' as any, undefined);
      setValue('studentsData' as any, []);
    }
  }, [isRepresentative, setValue]);

  const onSubmit = useCallback(
    (formdata: ExtendedUserInsert) => {
      // Validaciones básicas
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
        toast.error("Las contraseñas y Confirmación, no coinciden.");
        return;
      }

      // Si es representante, validar datos del representante
      if (isRepresentative) {
        if (!formdata.representativeData?.fullName?.trim() || 
            !formdata.representativeData?.identityCard?.trim()) {
          toast.error("Los datos del representante son requeridos para nivel 1");
          return;
        }
        
        // Validar que al menos haya un estudiante
        if (!formdata.studentsData || formdata.studentsData.length === 0) {
          toast.error("Debe agregar al menos un estudiante para el representante");
          return;
        }
        
        // Validar cada estudiante
        for (let i = 0; i < formdata.studentsData.length; i++) {
          const student = formdata.studentsData[i];
          if (!student.fullName?.trim() || !student.identityCard?.trim()) {
            toast.error(`El estudiante #${i + 1} debe tener nombre y cédula`);
            return;
          }
        }
      }

      // Preparar datos para enviar (cast a any para evitar errores de tipos)
      const dataToSend: any = {
        usermail: formdata.usermail,
        userlogin: formdata.userlogin,
        username: formdata.username,
        userpass: formdata.userpass,
        userrepass: formdata.userrepass,
        nivel: formdata.nivel,
        userstatus: formdata.userstatus,
      };

      // Solo agregar datos de representante si es nivel 1
      if (isRepresentative && formdata.representativeData) {
        dataToSend.representativeData = {
          ...formdata.representativeData,
          initialBalance: formdata.representativeData.initialBalance || 0,
        };
        dataToSend.studentsData = formdata.studentsData;
      }

      mutate(dataToSend, {
        onSuccess: (dataAPI) => {
          if (dataAPI.result) {
            reset();
            resetMutation();
            setFormKey((prev) => prev + 1);
            toast.success("Usuario registrado exitosamente");
          }
        },
        onError: (error: Error) => {
          toast.error(error.message || "Error al registrar usuario");
        }
      });
    },
    [mutate, reset, resetMutation, isRepresentative]
  );

  const handleCancel = useCallback(() => navigate('/admin/users/list'), [navigate]);

  const handleClear = useCallback(() => {
    reset();
    setFormKey(prev => prev + 1); 
    toast.info("Formulario limpiado");
  }, [reset]);

  return (
    <>
      {isPending && <SpinnerGeneral />}
      <AnimatedPage>
        <form 
          key={formKey}
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4"
        >
          {/* Título principal */}
          <div className="col-span-1">
            <h2 className="text-2xl text-center font-bold text-gray-800 mb-2">
              <FaUserPlus className="mr-4 inline-block" />
              Registrar Usuarios del Sistema
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Complete los datos del usuario. Los campos marcados con * son obligatorios.
            </p>
          </div>

          {/* Botones de Acción */}
          <ActionButtons onCancel={handleCancel} onClear={handleClear} />

          {/* Sección: Datos Principales */}
          <CollapsibleSection title="Datos Principales del Usuario">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField 
                id="usermail" 
                label="Email del Usuario *" 
                required={true} 
                register={register} 
                error={errors.usermail} 
                type="email"
              />
              <FormField 
                id="userlogin" 
                label="ID. del Usuario *" 
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
                type="select"
                id="nivel" 
                label="Nivel de Acceso *" 
                required={true} 
                register={register} 
                error={errors.nivel}
                defaultValue="1"
                options={[
                  { value: "1", text: "Representante" },
                  { value: "2", text: "Administrador" }
                ]}
              />
              <FormField 
                type="password"
                id="userpass" 
                label="Contraseña del Usuario *" 
                required={true} 
                register={register} 
                error={errors.userpass} 
              />
              <FormField 
                type="password"
                id="userrepass" 
                label="Confirmar Contraseña *" 
                required={true} 
                register={register} 
                error={errors.userrepass} 
              />
              <div className="md:col-span-2">
                <FormField 
                  type="checkbox"
                  id="userstatus" 
                  label="Usuario Activo" 
                  register={register} 
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Sección condicional para Representante */}
          {isRepresentative && (
            <>
              <RepresentativeForm register={register} errors={errors} />
              <StudentsForm control={control} register={register} errors={errors} />
              
              {/* Resumen */}
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <FaMoneyBillWave className="mr-2" /> Resumen del Registro
                </h4>
                <p className="text-gray-700">
                  Se registrará un <strong>representante</strong> con {(watch('studentsData' as any)?.length || 0)} estudiante(s) asociado(s).
                </p>
                {watch('representativeData.initialBalance' as any) !== 0 && (
                  <p className="text-gray-700 mt-2">
                    <strong>Saldo inicial:</strong> ${watch('representativeData.initialBalance' as any) || 0}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Mensaje para Administrativo */}
          {!isRepresentative && (
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-lg font-semibold mb-3">Usuario Administrativo</h4>
              <p className="text-gray-700">
                Se registrará un usuario con permisos administrativos. Este usuario no tendrá
                datos de representante ni estudiantes asociados.
              </p>
            </div>
          )}

          {/* Botón de envío */}
          <div className="col-span-1 flex justify-center mt-6">
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Registrando...' : 'Registrar Usuario'}
            </button>
          </div>
        </form>
      </AnimatedPage>
    </>
  );
}