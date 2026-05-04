import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { FiUsers, FiClipboard, FiPrinter } from 'react-icons/fi';

interface Estudiante {
  fullName: string;
  identityCard: string;
  birthDate: string;
  nationality: string;
  birthCountry: string;
  state: string;
  zone: string;
  addressDescription: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  hasAllergies: boolean;
  allergiesDescription: string;
  hasDiseases: boolean;
  diseasesDescription: string;
}

interface FormData {
  representativeFullName: string;
  representativeIdentityCard: string;
  representativeAddress: string;
  representativePhone: string;
  relationship: string;
  parentName: string;
  parentIdentityCard: string;
  parentPhone: string;
  students: Estudiante[];
}

const SolicitudInscripcion: React.FC = () => {
  const { register, handleSubmit, control, formState: { } } = useForm<FormData>({
    defaultValues: {
      students: [{
        fullName: '', identityCard: '', birthDate: '', nationality: '', birthCountry: '',
        state: '', zone: '', addressDescription: '', phone: '', emergencyContact: '',
        emergencyPhone: '', hasAllergies: false, allergiesDescription: '',
        hasDiseases: false, diseasesDescription: ''
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'students' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  const addStudent = () => {
    append({
      fullName: '', identityCard: '', birthDate: '', nationality: '', birthCountry: '',
      state: '', zone: '', addressDescription: '', phone: '', emergencyContact: '',
      emergencyPhone: '', hasAllergies: false, allergiesDescription: '',
      hasDiseases: false, diseasesDescription: ''
    });
  };

  const onSubmit = (data: FormData) => {
    setFormData(data);
    setShowSuccess(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
      >
        <div className="text-center mb-10">
          <FiClipboard className="mx-auto h-16 w-16 text-blue-800 mb-4" />
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Solicitud de Inscripción</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Llene los datos requeridos para generar la planilla que deberá presentar en la entrevista presencial.
            Todos los campos con * son obligatorios.
          </p>
        </div>

        {!showSuccess ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Datos del Representante */}
            <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center mb-4">
                <FiUsers className="mr-2 text-blue-700" /> Datos del Representante
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nombre Completo *</label>
                  <input {...register('representativeFullName', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Cédula de Identidad *</label>
                  <input {...register('representativeIdentityCard', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Dirección *</label>
                  <input {...register('representativeAddress', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Teléfono *</label>
                  <input {...register('representativePhone', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Relación con el estudiante *</label>
                  <input {...register('relationship', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nombre del Padre/Madre</label>
                  <input {...register('parentName')} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Cédula Padre/Madre</label>
                  <input {...register('parentIdentityCard')} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Teléfono Padre/Madre</label>
                  <input {...register('parentPhone')} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Sección Estudiantes */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <FiUsers className="mr-2 text-blue-700" /> Estudiantes
                </h2>
                <button type="button" onClick={addStudent}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition">
                  + Agregar Estudiante
                </button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="border border-slate-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-slate-700">Estudiante #{index + 1}</h3>
                    {index > 0 && (
                      <button type="button" onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Nombre Completo *</label>
                      <input {...register(`students.${index}.fullName`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Cédula *</label>
                      <input {...register(`students.${index}.identityCard`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Fecha de Nacimiento *</label>
                      <input type="date" {...register(`students.${index}.birthDate`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Nacionalidad *</label>
                      <input {...register(`students.${index}.nationality`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">País de Nacimiento *</label>
                      <input {...register(`students.${index}.birthCountry`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Estado *</label>
                      <input {...register(`students.${index}.state`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Zona *</label>
                      <input {...register(`students.${index}.zone`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">Dirección Completa *</label>
                      <textarea {...register(`students.${index}.addressDescription`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" rows={2}></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                      <input {...register(`students.${index}.phone`)} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Contacto de Emergencia *</label>
                      <input {...register(`students.${index}.emergencyContact`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Teléfono Emergencia *</label>
                      <input {...register(`students.${index}.emergencyPhone`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input type="checkbox" {...register(`students.${index}.hasAllergies`)} className="rounded border-slate-300" />
                        <span className="ml-2 text-sm">¿Tiene Alergias?</span>
                      </label>
                      <input {...register(`students.${index}.allergiesDescription`)} placeholder="Describa" className="ml-2 block w-48 rounded-lg border-slate-300 shadow-sm" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input type="checkbox" {...register(`students.${index}.hasDiseases`)} className="rounded border-slate-300" />
                        <span className="ml-2 text-sm">¿Tiene Enfermedades?</span>
                      </label>
                      <input {...register(`students.${index}.diseasesDescription`)} placeholder="Describa" className="ml-2 block w-48 rounded-lg border-slate-300 shadow-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button type="submit"
                className="bg-blue-800 text-white px-8 py-3 rounded-lg hover:bg-blue-900 transition font-semibold">
                Revisar y Generar Planilla
              </button>
            </div>
          </form>
        ) : (
          /* PANTALLA DE ÉXITO Y VISTA PREVIA DE IMPRESIÓN */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <FiPrinter className="mx-auto h-20 w-20 text-green-500 mb-6" />
            <h2 className="text-3xl font-bold text-slate-800 mb-4">¡Planilla Lista para Imprimir!</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Su planilla ha sido generada con éxito. Haga clic en el botón de abajo para <strong>imprimirla</strong> o <strong>guardarla como PDF</strong> desde el cuadro de diálogo.
            </p>

            {/* CONTENIDO QUE SE IMPRIMIRÁ (OCULTO EN PANTALLA) */}
            <div className="hidden print:block text-left mx-auto max-w-3xl">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">PLANILLA DE SOLICITUD DE INSCRIPCIÓN</h1>
                <p className="text-lg">U.E. José Antonio Abreu - Naguanagua</p>
                <p className="text-base">Fecha: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-bold underline mb-2">1. DATOS DEL REPRESENTANTE</h2>
                <p><strong>Nombre y Apellido:</strong> {formData?.representativeFullName}</p>
                <p><strong>Cédula:</strong> {formData?.representativeIdentityCard}</p>
                <p><strong>Dirección:</strong> {formData?.representativeAddress}</p>
                <p><strong>Teléfono:</strong> {formData?.representativePhone}</p>
                <p><strong>Relación:</strong> {formData?.relationship}</p>
                <p><strong>Padre/Madre:</strong> {formData?.parentName}</p>
                <p><strong>Cédula Padre/Madre:</strong> {formData?.parentIdentityCard}</p>
                <p><strong>Teléfono Padre/Madre:</strong> {formData?.parentPhone}</p>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-bold underline mb-2">2. DATOS DE LOS ESTUDIANTES</h2>
                {formData?.students.map((est, idx) => (
                  <div key={idx} className="mb-4 ml-4">
                    <h3 className="font-semibold">Estudiante {idx + 1}</h3>
                    <p><strong>Nombre:</strong> {est.fullName}</p>
                    <p><strong>Cédula:</strong> {est.identityCard}</p>
                    <p><strong>Fecha de Nacimiento:</strong> {est.birthDate}</p>
                    <p><strong>Nacionalidad:</strong> {est.nationality}</p>
                    <p><strong>País de Nacimiento:</strong> {est.birthCountry}</p>
                    <p><strong>Estado:</strong> {est.state}</p>
                    <p><strong>Zona:</strong> {est.zone}</p>
                    <p><strong>Dirección:</strong> {est.addressDescription}</p>
                    <p><strong>Teléfono:</strong> {est.phone}</p>
                    <p><strong>Contacto Emergencia:</strong> {est.emergencyContact}</p>
                    <p><strong>Teléfono Emergencia:</strong> {est.emergencyPhone}</p>
                    <p><strong>Alergias:</strong> {est.hasAllergies ? est.allergiesDescription : 'No'}</p>
                    <p><strong>Enfermedades:</strong> {est.hasDiseases ? est.diseasesDescription : 'No'}</p>
                  </div>
                ))}
              </div>
              <div className="text-center font-bold text-red-600 mt-8">
                IMPORTANTE: Debe presentar esta planilla en la entrevista presencial.
              </div>
            </div>

            {/* Recordatorio de la entrevista */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 max-w-lg mx-auto mb-8">
              <p className="text-lg font-semibold text-blue-900">
                Recuerde: La entrevista es obligatoria para completar el proceso de admisión. 
                Comuníquese con nosotros para programar su cita.
              </p>
              <div className="mt-4 text-blue-800">
                <p>Teléfonos: 0412-208.84.51 / 0412-341.87.73</p>
                <p>Correo: uejantonioabre@gmail.com</p>
                <p>Dirección: Av. Universidad sector la Campiña # 192-50, Naguanagua</p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="bg-green-600 text-white px-10 py-4 rounded-lg hover:bg-green-700 transition font-bold text-lg flex items-center justify-center mx-auto shadow-lg"
            >
              <FiPrinter className="mr-2" /> Imprimir PDF
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SolicitudInscripcion;