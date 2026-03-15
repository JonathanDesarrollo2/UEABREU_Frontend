import { useNavigate } from "react-router-dom";
import { useCallback, useState } from 'react';
import { toast } from "react-toastify";
import { FaUserPlus, FaMoneyBillWave, FaGraduationCap } from 'react-icons/fa';
import { useFieldArray } from 'react-hook-form';
import { CollapsibleSection } from "../../components/CollapsibleSection";
import { FormField } from "../../components/FormField";
import type { TypeLogin_insert } from "./schema/schema";
import SpinnerGeneral from "../../layouts/components/spinnerGeneral";
import AnimatedPage from "../../components/AnimatedPage";
import { ActionButtons } from "../../components/ActionButtons";
import { useInsertUserForm } from "./hook/useUserForm";
import { useAddUser } from "./hook/useAddUser";

// Opciones para el estado del estudiante
const studentStatusOptions = [
  { value: 'pendiente', text: 'Pendiente' },
  { value: 'regular', text: 'Regular' },
  { value: 'repitiente', text: 'Repitiente' },
  { value: 'condicionado', text: 'Condicionado' },
  { value: 'inactivo', text: 'Inactivo' }
];

// Opciones para grado y sección
const gradeOptions = ['1ro', '2do', '3ro', '4to', '5to', '6to'];
const sectionOptions = ['A', 'B', 'C', 'D'];

// Componente para el formulario del representante
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

// Componente para el listado de estudiantes
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
      emergencyPhone: '',
      status: 'pendiente',
      currentGrade: '1ro',  // valor por defecto
      section: 'A'          // valor por defecto
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
                <FaGraduationCap className="inline mr-2 text-blue-500" />
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
                  <FormField 
                    type="select"
                    id={`studentsData.${index}.status`} 
                    label="Estado Académico *" 
                    required={true}
                    register={register} 
                    error={errors?.studentsData?.[index]?.status}
                    options={studentStatusOptions}
                    defaultValue="pendiente"
                  />
                  {/* Grado y Sección */}
                  <FormField 
                    type="select"
                    id={`studentsData.${index}.currentGrade`} 
                    label="Grado *" 
                    required={true}
                    register={register} 
                    error={errors?.studentsData?.[index]?.currentGrade}
                    options={gradeOptions.map(g => ({ value: g, text: g }))}
                    defaultValue="1ro"
                  />
                  <FormField 
                    type="select"
                    id={`studentsData.${index}.section`} 
                    label="Sección *" 
                    required={true}
                    register={register} 
                    error={errors?.studentsData?.[index]?.section}
                    options={sectionOptions.map(s => ({ value: s, text: s }))}
                    defaultValue="A"
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
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useInsertUserForm();
  const { mutate, reset: resetMutation, isPending } = useAddUser();

  const nivel = watch('nivel');
  const isRepresentative = nivel === 1;
  const students = watch('studentsData') || [];

  const onSubmit = useCallback(
    (formdata: TypeLogin_insert) => {
      mutate(formdata, {
        onSuccess: (dataAPI) => {
          if (dataAPI.result) {
            reset();
            resetMutation();
            setFormKey((prev) => prev + 1);
          }
        },
        onError: () => {}
      });
    },
    [mutate, reset, resetMutation]
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
                      <span className="font-bold mx-1">{students.length}</span>
                      estudiante(s) asociado(s).
                    </p>
                    {watch('representativeData.initialBalance') !== 0 && (
                      <p className="text-gray-700 mt-2">
                        <strong>Saldo inicial:</strong> ${watch('representativeData.initialBalance') || 0}
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