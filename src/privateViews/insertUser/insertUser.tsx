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

const RepresentativeForm = ({ register, errors }: any) => {
  return (
    <CollapsibleSection title="Datos del Representante">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Información Personal</h3>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <FormField 
              id="representativeData.fullName" 
              label="Nombre Completo *" 
              required={true} 
              register={register} 
              error={errors?.representativeData?.fullName} 
            />
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <FormField 
              id="representativeData.identityCard" 
              label="Cédula de Identidad *" 
              required={true} 
              register={register} 
              error={errors?.representativeData?.identityCard} 
            />
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <FormField 
              id="representativeData.relationship" 
              label="Relación con el Estudiante *" 
              required={true} 
              register={register} 
              error={errors?.representativeData?.relationship} 
            />
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <FormField 
              id="representativeData.phone" 
              label="Teléfono *" 
              required={true} 
              register={register} 
              error={errors?.representativeData?.phone} 
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Dirección</h3>
        </div>

        <div className="flex justify-center md:col-span-2">
          <div className="w-full max-w-2xl">
            <FormField 
              id="representativeData.address" 
              label="Dirección Completa *" 
              required={true} 
              register={register} 
              error={errors?.representativeData?.address} 
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Información Financiera</h3>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
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
        </div>
      </div>
    </CollapsibleSection>
  );
};

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <button
            type="button"
            onClick={addStudent}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <span className="mr-2">+</span>
            Agregar Estudiante
          </button>
          <p className="text-sm text-gray-500 mt-2">
            {fields.length} estudiante(s) agregado(s)
          </p>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="mb-8 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">
                Estudiante #{index + 1}
              </h4>
              <button
                type="button"
                onClick={() => remove(index)}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <span className="mr-1">🗑</span>
                Eliminar Estudiante
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna 1 */}
                <div className="space-y-4">
                  <h5 className="text-md font-semibold text-gray-600 border-b pb-2">Datos Personales</h5>
                  <FormField 
                    id={`studentsData.${index}.fullName`} 
                    label="Nombre Completo *" 
                    required={true} 
                    register={register} 
                    error={errors?.studentsData?.[index]?.fullName} 
                  />
                  <FormField 
                    id={`studentsData.${index}.identityCard`} 
                    label="Cédula de Identidad *" 
                    required={true} 
                    register={register} 
                    error={errors?.studentsData?.[index]?.identityCard} 
                  />
                  <FormField 
                    type="date"
                    id={`studentsData.${index}.birthDate`} 
                    label="Fecha de Nacimiento *" 
                    required={true} 
                    register={register} 
                    error={errors?.studentsData?.[index]?.birthDate} 
                  />
                </div>

                {/* Columna 2 */}
                <div className="space-y-4">
                  <h5 className="text-md font-semibold text-gray-600 border-b pb-2">Nacionalidad</h5>
                  <FormField 
                    id={`studentsData.${index}.nationality`} 
                    label="Nacionalidad *" 
                    required={true} 
                    register={register} 
                    error={errors?.studentsData?.[index]?.nationality} 
                  />
                  <FormField 
                    id={`studentsData.${index}.birthCountry`} 
                    label="País de Nacimiento *" 
                    required={true} 
                    register={register} 
                    error={errors?.studentsData?.[index]?.birthCountry} 
                  />
                  <FormField 
                    id={`studentsData.${index}.phone`} 
                    label="Teléfono" 
                    register={register} 
                    error={errors?.studentsData?.[index]?.phone} 
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="border-t pt-4">
                <h5 className="text-md font-semibold text-gray-600 mb-4">Dirección</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField 
                    id={`studentsData.${index}.state`} 
                    label="Estado *" 
                    required={true} 
                    register={register} 
                    error={errors?.studentsData?.[index]?.state} 
                  />
                  <FormField 
                    id={`studentsData.${index}.zone`} 
                    label="Zona *" 
                    required={true} 
                    register={register} 
                    error={errors?.studentsData?.[index]?.zone} 
                  />
                </div>
                <div className="mt-4">
                  <div className="flex flex-col">
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
                      placeholder="Calle, número, sector, referencia..."
                    />
                    {errors?.studentsData?.[index]?.addressDescription && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.studentsData[index]?.addressDescription?.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de Salud */}
              <div className="border-t pt-4">
                <h5 className="text-md font-semibold text-gray-600 mb-4">Información de Salud</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id={`studentsData.${index}.hasAllergies`}
                        {...register(`studentsData.${index}.hasAllergies`)}
                        className="h-5 w-5 mr-2"
                      />
                      <label htmlFor={`studentsData.${index}.hasAllergies`} className="font-medium">
                        ¿Tiene Alergias?
                      </label>
                    </div>
                    <textarea
                      {...register(`studentsData.${index}.allergiesDescription`)}
                      placeholder="Describa las alergias del estudiante..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      rows={2}
                    />
                  </div>
                  
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id={`studentsData.${index}.hasDiseases`}
                        {...register(`studentsData.${index}.hasDiseases`)}
                        className="h-5 w-5 mr-2"
                      />
                      <label htmlFor={`studentsData.${index}.hasDiseases`} className="font-medium">
                        ¿Tiene Enfermedades?
                      </label>
                    </div>
                    <textarea
                      {...register(`studentsData.${index}.diseasesDescription`)}
                      placeholder="Describa las enfermedades del estudiante..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Contacto de Emergencia */}
              <div className="border-t pt-4">
                <h5 className="text-md font-semibold text-gray-600 mb-4">Contacto de Emergencia</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField 
                    id={`studentsData.${index}.emergencyContact`} 
                    label="Nombre del Contacto *" 
                    required={true} 
                    register={register} 
                    error={errors?.studentsData?.[index]?.emergencyContact} 
                  />
                  <FormField 
                    id={`studentsData.${index}.emergencyPhone`} 
                    label="Teléfono de Emergencia *" 
                    required={true} 
                    register={register} 
                    error={errors?.studentsData?.[index]?.emergencyPhone} 
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
};

export default function InsertUser() {
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);
  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useInsertUserForm();
  const { mutate, reset: resetMutation, isPending } = useAddUser();

  const nivel = watch('nivel');
  const isRepresentative = nivel === 1;

  useEffect(() => {
    if (!isRepresentative) {
      setValue('representativeData' as any, undefined);
      setValue('studentsData' as any, []);
    }
  }, [isRepresentative, setValue]);

  const onSubmit = useCallback(
    (formdata: ExtendedUserInsert) => {
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

      if (isRepresentative) {
        if (!formdata.representativeData?.fullName?.trim() || 
            !formdata.representativeData?.identityCard?.trim()) {
          toast.error("Los datos del representante son requeridos para nivel 1");
          return;
        }
        
        if (!formdata.studentsData || formdata.studentsData.length === 0) {
          toast.error("Debe agregar al menos un estudiante para el representante");
          return;
        }
        
        for (let i = 0; i < formdata.studentsData.length; i++) {
          const student = formdata.studentsData[i];
          if (!student.fullName?.trim() || !student.identityCard?.trim()) {
            toast.error(`El estudiante #${i + 1} debe tener nombre y cédula`);
            return;
          }
        }
      }

      const dataToSend: any = {
        usermail: formdata.usermail,
        userlogin: formdata.userlogin,
        username: formdata.username,
        userpass: formdata.userpass,
        userrepass: formdata.userrepass,
        nivel: formdata.nivel,
        userstatus: formdata.userstatus,
      };
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
      
      <AnimatedPage className="flex justify-center">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
              <FaUserPlus className="mr-3" />
              Registrar Usuarios del Sistema
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete los datos del usuario. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
            </p>
          </div>

          <ActionButtons 
            onCancel={handleCancel} 
            onClear={handleClear} 
          />

          <form 
            key={formKey}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* Sección: Datos Principales */}
            <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
                Datos Principales del Usuario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField 
                      id="usermail" 
                      label="Email del Usuario *" 
                      required={true} 
                      register={register} 
                      error={errors.usermail} 
                      type="email"
                    />
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField 
                      id="userlogin" 
                      label="ID del Usuario *" 
                      required={true} 
                      register={register} 
                      error={errors.userlogin} 
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField 
                      id="username" 
                      label="Nombre del Usuario" 
                      register={register} 
                      error={errors.username} 
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
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
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField 
                      type="password"
                      id="userpass" 
                      label="Contraseña *" 
                      required={true} 
                      register={register} 
                      error={errors.userpass} 
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField 
                      type="password"
                      id="userrepass" 
                      label="Confirmar Contraseña *" 
                      required={true} 
                      register={register} 
                      error={errors.userrepass} 
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-center">
                  <div className="w-full max-w-sm">
                    <FormField 
                      type="checkbox"
                      id="userstatus" 
                      label="Usuario Activo" 
                      register={register} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección condicional para Representante */}
            {isRepresentative && (
              <>
                <RepresentativeForm register={register} errors={errors} />
                <StudentsForm control={control} register={register} errors={errors} />
                
                {/* Resumen */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-4xl mx-auto">
                  <div className="flex items-center justify-center mb-4">
                    <FaMoneyBillWave className="text-blue-500 text-xl mr-2" />
                    <h4 className="text-lg font-semibold text-blue-800">Resumen del Registro</h4>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-700">
                      Se registrará un <strong className="text-blue-600">representante</strong> con 
                      <span className="font-bold mx-1">{(watch('studentsData' as any)?.length || 0)}</span>
                      estudiante(s) asociado(s).
                    </p>
                    {watch('representativeData.initialBalance' as any) !== 0 && (
                      <p className="text-gray-700 mt-2">
                        <strong>Saldo inicial:</strong> ${watch('representativeData.initialBalance' as any) || 0}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Mensaje para Administrativo */}
            {!isRepresentative && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-4xl mx-auto text-center">
                <h4 className="text-lg font-semibold text-green-800 mb-3">Usuario Administrativo</h4>
                <p className="text-gray-700">
                  Se registrará un usuario con permisos administrativos.
                  <br />
                  Este usuario no tendrá datos de representante ni estudiantes asociados.
                </p>
              </div>
            )}

            {/* Botón de envío */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="px-10 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                {isPending ? 'Registrando...' : 'Registrar Usuario'}
              </button>
            </div>
          </form>
        </div>
      </AnimatedPage>
    </>
  );
}