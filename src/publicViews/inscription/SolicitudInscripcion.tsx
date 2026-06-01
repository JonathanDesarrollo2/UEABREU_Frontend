import React from 'react';
import { type Control, type UseFormRegister, type FieldArrayWithId } from 'react-hook-form';
import { FiMail, FiUsers, FiEye, FiEyeOff } from 'react-icons/fi';
import type { InscripcionFormData } from '../../types/inscripcion';
import { FormField } from '../../components/FormField';

interface Props {
  register: UseFormRegister<InscripcionFormData>;
  control: Control<InscripcionFormData>;
  fields: FieldArrayWithId<InscripcionFormData, 'students', 'id'>[];
  onRemoveStudent: (index: number) => void;
  onAddStudent: (student: any) => void;
  showPassword: boolean;
  togglePassword: () => void;
  showConfirmPassword: boolean;
  toggleConfirmPassword: () => void;
}

const FormularioSections: React.FC<Props> = ({
  register,
  fields,
  onRemoveStudent,
  onAddStudent,
  showPassword,
  togglePassword,
  showConfirmPassword,
  toggleConfirmPassword,
}) => {
  const handleAddStudent = () => {
    onAddStudent({
      fullName: '', identityCard: '', birthDate: '', nationality: '', birthCountry: '',
      state: '', zone: '', addressDescription: '', phone: '', emergencyContact: '',
      emergencyPhone: '', hasAllergies: false, allergiesDescription: '',
      hasDiseases: false, diseasesDescription: '', previousSchool: '', municipality: '',
      aspiredGrade: '',
    });
  };

  return (
    <>
      {/* Sección Cuenta */}
      <div className="bg-white rounded-xl p-6 border border-slate-300">
        <h2 className="text-xl font-bold text-slate-800 flex items-center mb-4">
          <FiMail className="mr-2 text-blue-700" /> Datos de la cuenta
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField<InscripcionFormData>
            id="email"
            label="Correo Electrónico"
            type="email"
            required
            register={register}
          />
          <FormField<InscripcionFormData>
            id="userlogin"
            label="Usuario (opcional, se asigna automáticamente)"
            register={register}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: true, minLength: 6 })}
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm pr-10"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar Contraseña <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', { required: true })}
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm pr-10"
              />
              <button
                type="button"
                onClick={toggleConfirmPassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Representante */}
      <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-slate-800 flex items-center mb-4">
          <FiUsers className="mr-2 text-blue-700" /> Datos del Representante
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField<InscripcionFormData>
            id="representativeFullName"
            label="Nombre Completo"
            required
            register={register}
          />
          <FormField<InscripcionFormData>
            id="representativeIdentityCard"
            label="Cédula de Identidad"
            required
            register={register}
          />
          <div className="md:col-span-2">
            <FormField<InscripcionFormData>
              id="representativeAddress"
              label="Dirección"
              required
              register={register}
            />
          </div>
          <FormField<InscripcionFormData>
            id="representativePhone"
            label="Teléfono"
            required
            register={register}
          />
          <FormField<InscripcionFormData>
            id="relationship"
            label="Relación con el estudiante"
            required
            register={register}
          />
          <FormField<InscripcionFormData>
            id="parentName"
            label="Nombre del Padre/Madre"
            register={register}
          />
          <FormField<InscripcionFormData>
            id="parentIdentityCard"
            label="Cédula Padre/Madre"
            register={register}
          />
          <FormField<InscripcionFormData>
            id="parentPhone"
            label="Teléfono Padre/Madre"
            register={register}
          />
        </div>
      </div>

      {/* Sección Solicitantes */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <FiUsers className="mr-2 text-blue-700" /> Solicitantes ({fields.length})
          </h2>
          <button
            type="button"
            onClick={handleAddStudent}
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
          >
            + Agregar Solicitante
          </button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="border border-slate-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-slate-700">Solicitante #{index + 1}</h3>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => onRemoveStudent(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Eliminar
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField<InscripcionFormData>
                id={`students.${index}.fullName`}
                label="Nombre Completo"
                required
                register={register}
              />
              <FormField<InscripcionFormData>
                id={`students.${index}.identityCard`}
                label="Cédula"
                required
                register={register}
              />
              <FormField<InscripcionFormData>
                id={`students.${index}.birthDate`}
                label="Fecha de Nacimiento"
                type="date"
                required
                register={register}
              />
              <FormField<InscripcionFormData>
                id={`students.${index}.nationality`}
                label="Nacionalidad"
                required
                register={register}
              />
              <FormField<InscripcionFormData>
                id={`students.${index}.birthCountry`}
                label="País de Nacimiento"
                required
                register={register}
              />
              <FormField<InscripcionFormData>
                id={`students.${index}.state`}
                label="Estado"
                required
                register={register}
              />
              <FormField<InscripcionFormData>
                id={`students.${index}.zone`}
                label="Zona donde vive"
                required
                register={register}
              />
              <FormField<InscripcionFormData>
                id={`students.${index}.municipality`}
                label="Municipio"
                register={register}
              />
              <FormField<InscripcionFormData>
                id={`students.${index}.previousSchool`}
                label="Escuela de Procedencia"
                register={register}
              />
              <FormField<InscripcionFormData>
                id={`students.${index}.aspiredGrade`}
                label="Año que aspira a cursar"
                type="select"
                required
                register={register}
                options={[
                  { value: '', text: 'Seleccione un año' },
                  { value: '1er año', text: '1er año' },
                  { value: '2do año', text: '2do año' },
                  { value: '3er año', text: '3er año' },
                  { value: '4to año', text: '4to año' },
                  { value: '5to año', text: '5to año' },
                ]}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Dirección Completa <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register(`students.${index}.addressDescription`, { required: true })}
                  className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm"
                  rows={2}
                />
              </div>
              <FormField<InscripcionFormData>
                id={`students.${index}.phone`}
                label="Teléfono"
                register={register}
              />
              <FormField<InscripcionFormData>
                id={`students.${index}.emergencyContact`}
                label="Contacto de Emergencia"
                required
                register={register}
              />
              <FormField<InscripcionFormData>
                id={`students.${index}.emergencyPhone`}
                label="Teléfono Emergencia"
                required
                register={register}
              />
              <div className="flex items-center space-x-4">
                <FormField<InscripcionFormData>
                  id={`students.${index}.hasAllergies`}
                  label="¿Tiene Alergias?"
                  type="checkbox"
                  register={register}
                />
                <input
                  {...register(`students.${index}.allergiesDescription`)}
                  placeholder="Describa"
                  className="ml-2 block w-48 rounded-lg border-slate-300 shadow-sm"
                />
              </div>
              <div className="flex items-center space-x-4">
                <FormField<InscripcionFormData>
                  id={`students.${index}.hasDiseases`}
                  label="¿Tiene Enfermedades?"
                  type="checkbox"
                  register={register}
                />
                <input
                  {...register(`students.${index}.diseasesDescription`)}
                  placeholder="Describa"
                  className="ml-2 block w-48 rounded-lg border-slate-300 shadow-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FormularioSections;