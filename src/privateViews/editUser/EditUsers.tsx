// src/views/admin/users/EditUser.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FaEdit, FaGraduationCap } from 'react-icons/fa';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { FormField } from '../../components/FormField';
import SpinnerGeneral from '../../layouts/components/spinnerGeneral';
import AnimatedPage from '../../components/AnimatedPage';
import { ActionButtons } from '../../components/ActionButtons';
import { updateUser } from '../../apis/user';
import type { TypeApiResponseGeneric } from '../../types/login';

const studentStatusOptions = [
  { value: 'pendiente', text: 'Pendiente' },
  { value: 'regular', text: 'Regular' },
  { value: 'repitiente', text: 'Repitiente' },
  { value: 'condicionado', text: 'Condicionado' },
  { value: 'inactivo', text: 'Inactivo' },
];

const gradeOptions = ['1ro', '2do', '3ro', '4to', '5to', '6to'];
const sectionOptions = ['A', 'B', 'C', 'D'];

interface StudentForm {
  id?: string;
  fullName: string;
  identityCard: string;
  birthDate: string;
  admissionDate?: string;
  state: string;
  zone: string;
  addressDescription: string;
  phone: string;
  nationality: string;
  birthCountry: string;
  hasAllergies: boolean;
  allergiesDescription: string;
  hasDiseases: boolean;
  diseasesDescription: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: string;
  currentGrade: string;
  section: string;
  balance: number;
}

interface EditUserForm {
  id: string;
  usermail: string;
  userlogin: string;
  username: string;
  nivel: number;
  userstatus: boolean;
  userpass?: string;
  userrepass?: string;
  representativeData: {
    fullName: string;
    identityCard: string;
    address: string;
    phone: string;
    relationship: string;
    initialBalance?: number;
  };
  studentsData: StudentForm[];
}

export default function EditUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = (location.state as any)?.userData;
  const [isPending, setIsPending] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<EditUserForm>({
    defaultValues: {
      id: userData?.id || '',
      usermail: userData?.usermail || '',
      userlogin: userData?.userlogin || '',
      username: userData?.username || '',
      nivel: userData?.nivel || 1,
      userstatus: userData?.userstatus ?? true,
      userpass: '',
      userrepass: '',
      representativeData: {
        fullName: userData?.representative?.fullName || '',
        identityCard: userData?.representative?.identityCard || '',
        address: userData?.representative?.address || '',
        phone: userData?.representative?.phone || '',
        relationship: userData?.representative?.relationship || '',
        initialBalance: userData?.representative?.balance || 0,
      },
      studentsData: userData?.representative?.students?.map((s: any) => ({
        id: s.id,
        fullName: s.fullName || '',
        identityCard: s.identityCard || '',
        birthDate: s.birthDate ? new Date(s.birthDate).toISOString().split('T')[0] : '',
        admissionDate: s.admissionDate ? new Date(s.admissionDate).toISOString().split('T')[0] : '',
        state: s.state || '',
        zone: s.zone || '',
        addressDescription: s.addressDescription || '',
        phone: s.phone || '',
        nationality: s.nationality || '',
        birthCountry: s.birthCountry || '',
        hasAllergies: s.hasAllergies || false,
        allergiesDescription: s.allergiesDescription || '',
        hasDiseases: s.hasDiseases || false,
        diseasesDescription: s.diseasesDescription || '',
        emergencyContact: s.emergencyContact || '',
        emergencyPhone: s.emergencyPhone || '',
        status: s.status || 'pendiente',
        currentGrade: s.currentGrade || '1ro',
        section: s.section || 'A',
        balance: s.balance || 0,
      })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'studentsData',
  });

  const onSubmit = async (formData: EditUserForm) => {
    setIsPending(true);
    try {
      const payload: any = {
        id: formData.id,
        usermail: formData.usermail,
        userlogin: formData.userlogin,
        username: formData.username,
        nivel: formData.nivel,
        userstatus: formData.userstatus,
        representativeData: {
          fullName: formData.representativeData.fullName,
          identityCard: formData.representativeData.identityCard,
          address: formData.representativeData.address,
          phone: formData.representativeData.phone,
          relationship: formData.representativeData.relationship,
          initialBalance: formData.representativeData.initialBalance || 0,
        },
        studentsData: formData.studentsData.map((s) => ({
          id: s.id,
          fullName: s.fullName,
          identityCard: s.identityCard,
          birthDate: s.birthDate,
          admissionDate: s.admissionDate,
          state: s.state,
          zone: s.zone,
          addressDescription: s.addressDescription,
          phone: s.phone || '',
          nationality: s.nationality,
          birthCountry: s.birthCountry,
          hasAllergies: s.hasAllergies,
          allergiesDescription: s.allergiesDescription || '',
          hasDiseases: s.hasDiseases,
          diseasesDescription: s.diseasesDescription || '',
          emergencyContact: s.emergencyContact,
          emergencyPhone: s.emergencyPhone,
          status: s.status,
          currentGrade: s.currentGrade,
          section: s.section,
          balance: s.balance,
        })),
      };

      if (formData.userpass && formData.userpass === formData.userrepass) {
        payload.userpass = formData.userpass;
        payload.userrepass = formData.userrepass;
      }

      const response: TypeApiResponseGeneric = await updateUser(payload);
      if (response.result) {
        toast.success('Usuario actualizado correctamente');
        navigate('/admin/users/list');
      } else {
        toast.error(response.error[0] || 'Error al actualizar usuario');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error de conexión');
    } finally {
      setIsPending(false);
    }
  };

  const handleCancel = () => navigate('/admin/users/list');
  const handleClear = () => {
    reset();
    toast.info('Formulario restaurado a valores originales');
  };

  const addStudent = () => {
    append({
      id: undefined,
      fullName: '',
      identityCard: '',
      birthDate: '',
      admissionDate: new Date().toISOString().split('T')[0],
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
      currentGrade: '1ro',
      section: 'A',
      balance: 0,
    });
  };

  if (isPending) return <SpinnerGeneral />;

  return (
    <AnimatedPage className="flex justify-center">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <FaEdit className="mr-3" />
            Actualizar Usuario
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Modifique los datos del usuario y sus estudiantes.
          </p>
        </div>

        <ActionButtons onCancel={handleCancel} onClear={handleClear} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Datos principales */}
          <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
              Datos Principales del Usuario
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField id="usermail" label="Email del Usuario *" required register={register} error={errors.usermail} type="email" />
              <FormField id="userlogin" label="ID del Usuario *" required register={register} error={errors.userlogin} />
              <FormField id="username" label="Nombre del Usuario" register={register} error={errors.username} />
              <FormField
                type="select"
                id="nivel"
                label="Nivel de Acceso *"
                required
                register={register}
                error={errors.nivel}
                defaultValue={userData?.nivel || 1}
                options={[
                  { value: 1, text: 'Representante' },
                  { value: 2, text: 'Administrador' },
                ]}
              />
              <FormField type="password" id="userpass" label="Nueva Contraseña (opcional)" register={register} error={errors.userpass} />
              <FormField type="password" id="userrepass" label="Confirmar Contraseña" register={register} error={errors.userrepass} />
              <FormField type="checkbox" id="userstatus" label="Usuario Activo" register={register} />
            </div>
          </div>

          {/* Datos del representante */}
          <CollapsibleSection title="Datos del Representante">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <FormField id="representativeData.fullName" label="Nombre Completo *" required register={register} error={errors.representativeData?.fullName} />
              <FormField id="representativeData.identityCard" label="Cédula de Identidad *" required register={register} error={errors.representativeData?.identityCard} />
              <FormField id="representativeData.relationship" label="Relación con el Estudiante *" required register={register} error={errors.representativeData?.relationship} />
              <FormField id="representativeData.phone" label="Teléfono *" required register={register} error={errors.representativeData?.phone} />
              <div className="md:col-span-2">
                <FormField id="representativeData.address" label="Dirección Completa *" required register={register} error={errors.representativeData?.address} />
              </div>
              <div className="md:col-span-2">
                <FormField
                  type="number"
                  id="representativeData.initialBalance"
                  label="Saldo Inicial (Global)"
                  register={register}
                  error={errors.representativeData?.initialBalance}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Estudiantes */}
          <CollapsibleSection title="Estudiantes">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 text-center">
                <button type="button" onClick={addStudent} className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                  <span className="mr-2">+</span> Agregar Estudiante
                </button>
                <p className="text-sm text-gray-500 mt-2">{fields.length} estudiante(s)</p>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="mb-8 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-800">
                      <FaGraduationCap className="inline mr-2 text-blue-500" />
                      Estudiante #{index + 1}
                    </h4>
                    <button type="button" onClick={() => remove(index)} className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
                      Eliminar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField id={`studentsData.${index}.fullName`} label="Nombre Completo *" required register={register} error={(errors as any)?.studentsData?.[index]?.fullName} />
                    <FormField id={`studentsData.${index}.identityCard`} label="Cédula *" required register={register} error={(errors as any)?.studentsData?.[index]?.identityCard} />
                    <FormField type="date" id={`studentsData.${index}.birthDate`} label="Fecha de Nacimiento *" required register={register} error={(errors as any)?.studentsData?.[index]?.birthDate} />
                    {/* Fecha de ingreso: input normal con disabled para existentes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Ingreso</label>
                      <input
                        type="date"
                        {...register(`studentsData.${index}.admissionDate`)}
                        disabled={!!field.id}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                    <FormField type="select" id={`studentsData.${index}.status`} label="Estado Académico *" required register={register} error={(errors as any)?.studentsData?.[index]?.status} options={studentStatusOptions} />
                    <FormField type="select" id={`studentsData.${index}.currentGrade`} label="Grado *" required register={register} error={(errors as any)?.studentsData?.[index]?.currentGrade} options={gradeOptions.map(g => ({ value: g, text: g }))} />
                    <FormField type="select" id={`studentsData.${index}.section`} label="Sección *" required register={register} error={(errors as any)?.studentsData?.[index]?.section} options={sectionOptions.map(s => ({ value: s, text: s }))} />
                    <FormField type="number" id={`studentsData.${index}.balance`} label="Saldo Inicial" register={register} error={(errors as any)?.studentsData?.[index]?.balance} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <FormField id={`studentsData.${index}.nationality`} label="Nacionalidad *" required register={register} error={(errors as any)?.studentsData?.[index]?.nationality} />
                    <FormField id={`studentsData.${index}.birthCountry`} label="País de Nacimiento *" required register={register} error={(errors as any)?.studentsData?.[index]?.birthCountry} />
                    <FormField id={`studentsData.${index}.phone`} label="Teléfono" register={register} error={(errors as any)?.studentsData?.[index]?.phone} />
                    <FormField id={`studentsData.${index}.state`} label="Estado *" required register={register} error={(errors as any)?.studentsData?.[index]?.state} />
                    <FormField id={`studentsData.${index}.zone`} label="Zona *" required register={register} error={(errors as any)?.studentsData?.[index]?.zone} />
                  </div>

                  <div className="mt-4">
                    <label className="text-gray-700 font-bold mb-1">Descripción de la Dirección *</label>
                    <textarea
                      {...register(`studentsData.${index}.addressDescription`, { required: 'Este campo es requerido' })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <input type="checkbox" id={`studentsData.${index}.hasAllergies`} {...register(`studentsData.${index}.hasAllergies`)} className="h-5 w-5 mr-2" />
                        <label>¿Alergias?</label>
                      </div>
                      <textarea {...register(`studentsData.${index}.allergiesDescription`)} rows={2} className="w-full border rounded-md" />
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <input type="checkbox" id={`studentsData.${index}.hasDiseases`} {...register(`studentsData.${index}.hasDiseases`)} className="h-5 w-5 mr-2" />
                        <label>¿Enfermedades?</label>
                      </div>
                      <textarea {...register(`studentsData.${index}.diseasesDescription`)} rows={2} className="w-full border rounded-md" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField id={`studentsData.${index}.emergencyContact`} label="Contacto de Emergencia *" required register={register} error={(errors as any)?.studentsData?.[index]?.emergencyContact} />
                    <FormField id={`studentsData.${index}.emergencyPhone`} label="Tel. Emergencia *" required register={register} error={(errors as any)?.studentsData?.[index]?.emergencyPhone} />
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="px-10 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
            >
              {isPending ? 'Actualizando...' : 'Actualizar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </AnimatedPage>
  );
}