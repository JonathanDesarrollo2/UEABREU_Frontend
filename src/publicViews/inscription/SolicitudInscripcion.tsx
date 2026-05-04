import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { FiDownload, FiUsers, FiClipboard, FiPrinter } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  const { register, handleSubmit, control, formState: {} } = useForm<FormData>({
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

  const addStudent = () => {
    append({ 
      fullName: '', identityCard: '', birthDate: '', nationality: '', birthCountry: '',
      state: '', zone: '', addressDescription: '', phone: '', emergencyContact: '',
      emergencyPhone: '', hasAllergies: false, allergiesDescription: '',
      hasDiseases: false, diseasesDescription: ''
    });
  };

  const generarPDF = (data: FormData) => {
    const doc = new jsPDF();
    let y = 20;

    // Título
    doc.setFontSize(16);
    doc.text('PLANILLA DE SOLICITUD DE INSCRIPCIÓN', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(10);
    doc.text('U.E. José Antonio Abreu - Naguanagua', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, y, { align: 'center' });
    y += 15;

    // Datos del Representante
    doc.setFontSize(12);
    doc.text('1. DATOS DEL REPRESENTANTE', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Nombre y Apellido: ${data.representativeFullName}`, 14, y);
    y += 6;
    doc.text(`Cédula de Identidad: ${data.representativeIdentityCard}`, 14, y);
    y += 6;
    doc.text(`Dirección: ${data.representativeAddress}`, 14, y);
    y += 6;
    doc.text(`Teléfono: ${data.representativePhone}`, 14, y);
    y += 6;
    doc.text(`Relación con el estudiante: ${data.relationship}`, 14, y);
    y += 6;
    doc.text(`Nombre del Padre/Madre: ${data.parentName}`, 14, y);
    y += 6;
    doc.text(`Cédula Padre/Madre: ${data.parentIdentityCard}`, 14, y);
    y += 6;
    doc.text(`Teléfono Padre/Madre: ${data.parentPhone}`, 14, y);
    y += 12;

    // Datos de Estudiantes
    doc.setFontSize(12);
    doc.text('2. DATOS DE LOS ESTUDIANTES', 14, y);
    y += 8;
    data.students.forEach((est, idx) => {
      doc.setFontSize(10);
      doc.text(`Estudiante ${idx + 1}:`, 14, y);
      y += 6;
      doc.text(`  Nombre y Apellido: ${est.fullName}`, 16, y);
      y += 6;
      doc.text(`  Cédula Escolar/Identidad: ${est.identityCard}`, 16, y);
      y += 6;
      doc.text(`  Fecha de Nacimiento: ${est.birthDate}`, 16, y);
      y += 6;
      doc.text(`  Nacionalidad: ${est.nationality}`, 16, y);
      y += 6;
      doc.text(`  País de Nacimiento: ${est.birthCountry}`, 16, y);
      y += 6;
      doc.text(`  Estado: ${est.state}`, 16, y);
      y += 6;
      doc.text(`  Zona: ${est.zone}`, 16, y);
      y += 6;
      doc.text(`  Dirección: ${est.addressDescription}`, 16, y);
      y += 6;
      doc.text(`  Teléfono: ${est.phone}`, 16, y);
      y += 6;
      doc.text(`  Contacto de Emergencia: ${est.emergencyContact}`, 16, y);
      y += 6;
      doc.text(`  Teléfono Emergencia: ${est.emergencyPhone}`, 16, y);
      y += 6;
      doc.text(`  Alergias: ${est.hasAllergies ? est.allergiesDescription : 'No'}`, 16, y);
      y += 6;
      doc.text(`  Enfermedades: ${est.hasDiseases ? est.diseasesDescription : 'No'}`, 16, y);
      y += 10;
    });

    // Nota final
    y += 10;
    doc.setFontSize(12);
    doc.text('IMPORTANTE: Debe presentar esta planilla en la entrevista presencial.', 14, y);
    
    doc.save('Planilla_Inscripcion_UEEA.pdf');
  };

  const onSubmit = (data: FormData) => {
    generarPDF(data);
    setShowSuccess(true);
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

            {/* Estudiantes */}
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
                className="bg-blue-800 text-white px-8 py-3 rounded-lg hover:bg-blue-900 transition font-semibold flex items-center">
                <FiDownload className="mr-2" /> Generar y Descargar Planilla
              </button>
            </div>
          </form>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <FiPrinter className="mx-auto h-20 w-20 text-green-500 mb-6" />
            <h2 className="text-3xl font-bold text-slate-800 mb-4">¡Planilla Generada Exitosamente!</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Su planilla de solicitud ha sido descargada. Ahora debe <strong>presentarla en la entrevista presencial</strong> en nuestras instalaciones.
            </p>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 max-w-lg mx-auto">
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
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SolicitudInscripcion;