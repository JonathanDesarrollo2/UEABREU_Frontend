import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { FiUsers, FiClipboard, FiPrinter, FiMail } from 'react-icons/fi';
import type { PublicRegisterPayload } from '../../types/publicRegistration';
import { toast } from 'react-toastify';
import { usePublicRegistration } from './hooks/usePublicRegistration';

// ------------------------------------------------------
// Tipos locales
// ------------------------------------------------------
interface EstudianteForm {
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
  email: string;
  password: string;
  confirmPassword: string;
  userlogin: string;
  representativeFullName: string;
  representativeIdentityCard: string;
  representativeAddress: string;
  representativePhone: string;
  relationship: string;
  parentName: string;
  parentIdentityCard: string;
  parentPhone: string;
  students: EstudianteForm[];
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://appservices.ueabreu.com';

// ------------------------------------------------------
// Componente principal
// ------------------------------------------------------
const SolicitudInscripcion: React.FC = () => {
  const { step, loading, registeredEmail, handleRegister, handleVerify } = usePublicRegistration();

  const [formDataForPDF, setFormDataForPDF] = useState<FormData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null);

  const { register, handleSubmit, control, formState: {  } } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      userlogin: '',
      representativeFullName: '',
      representativeIdentityCard: '',
      representativeAddress: '',
      representativePhone: '',
      relationship: '',
      parentName: '',
      parentIdentityCard: '',
      parentPhone: '',
      students: [{
        fullName: '', identityCard: '', birthDate: '', nationality: '', birthCountry: '',
        state: '', zone: '', addressDescription: '', phone: '', emergencyContact: '',
        emergencyPhone: '', hasAllergies: false, allergiesDescription: '',
        hasDiseases: false, diseasesDescription: ''
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'students' });

  // Verificar si las inscripciones están habilitadas
  useEffect(() => {
    fetch(`${API_BASE}/api/public/registration-status`)
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          setRegistrationOpen(data.content.registrationsEnabled);
        } else {
          setRegistrationOpen(false);
        }
      })
      .catch(() => setRegistrationOpen(false));
  }, []);

  // Generar un login automático si no se proporciona
  const generateLogin = () => 'Rep' + Math.floor(1000 + Math.random() * 9000);

  const addStudent = () => {
    append({
      fullName: '', identityCard: '', birthDate: '', nationality: '', birthCountry: '',
      state: '', zone: '', addressDescription: '', phone: '', emergencyContact: '',
      emergencyPhone: '', hasAllergies: false, allergiesDescription: '',
      hasDiseases: false, diseasesDescription: ''
    });
  };

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const login = data.userlogin.trim() === '' ? generateLogin() : data.userlogin;

    const payload: PublicRegisterPayload = {
      usermail: data.email,
      userlogin: login,
      userpass: data.password,
      userrepass: data.confirmPassword,
      representativeData: {
        fullName: data.representativeFullName,
        identityCard: data.representativeIdentityCard,
        address: data.representativeAddress,
        phone: data.representativePhone,
        relationship: data.relationship,
        parentName: data.parentName,
        parentIdentityCard: data.parentIdentityCard,
        parentPhone: data.parentPhone,
      },
      studentsData: data.students
        .filter(s => s.fullName && s.identityCard)
        .map(s => ({
          fullName: s.fullName,
          identityCard: s.identityCard,
          birthDate: s.birthDate,
          nationality: s.nationality,
          birthCountry: s.birthCountry,
          state: s.state,
          zone: s.zone,
          addressDescription: s.addressDescription,
          phone: s.phone || '',
          emergencyContact: s.emergencyContact,
          emergencyPhone: s.emergencyPhone,
          hasAllergies: s.hasAllergies || false,
          allergiesDescription: s.allergiesDescription || '',
          hasDiseases: s.hasDiseases || false,
          diseasesDescription: s.diseasesDescription || '',
          currentGrade: 'En asignar',
          section: 'Pendiente',
          status: 'pendiente',
          balance: 0
        }))
    };

    setFormDataForPDF(data);
    await handleRegister(payload);
  };

  const handlePrint = () => {
    window.print();
  };

  // ------------------------------------------------------
  // Estados de carga / inscripciones cerradas
  // ------------------------------------------------------
  if (registrationOpen === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4" />
          <p className="text-slate-600">Verificando disponibilidad de inscripciones...</p>
        </div>
      </div>
    );
  }

  if (!registrationOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl shadow-xl"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Inscripciones Cerradas</h2>
          <p className="text-slate-600 mb-6">
            En este momento no estamos recibiendo nuevas solicitudes. Por favor, comunícate con nosotros para más información.
          </p>
          <div className="text-blue-800">
            <p>Teléfonos: 0412-208.84.51 / 0412-341.87.73</p>
            <p>Correo: uejantonioabre@gmail.com</p>
            <p>Dirección: Av. Universidad sector la Campiña # 192-50, Naguanagua</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ------------------------------------------------------
  // Vista principal (formulario / verificación / éxito)
  // ------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
      {/* Estilos de impresión optimizados */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: auto;
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .avoid-break {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
      >
        {/* ------------------------------------------------------ */}
        {/* PASO 1 – FORMULARIO                                   */}
        {/* ------------------------------------------------------ */}
        {step === 'form' && (
          <>
            <div className="text-center mb-10">
              <FiClipboard className="mx-auto h-16 w-16 text-blue-800 mb-4" />
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Solicitud de Inscripción</h1>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Complete todos los datos. Recibirá un código de verificación en su correo.
                Su cuenta quedará pendiente de activación hasta la entrevista presencial.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Cuenta */}
              <div className="bg-white rounded-xl p-6 border border-slate-300">
                <h2 className="text-xl font-bold text-slate-800 flex items-center mb-4">
                  <FiMail className="mr-2 text-blue-700" /> Datos de la cuenta
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Correo Electrónico *</label>
                    <input type="email" {...register('email', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Usuario (opcional, se asigna automáticamente)</label>
                    <input {...register('userlogin')} placeholder="Ej: Rep1234" className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Contraseña *</label>
                    <input type="password" {...register('password', { required: true, minLength: 6 })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Confirmar Contraseña *</label>
                    <input type="password" {...register('confirmPassword', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Representante */}
              <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-slate-800 flex items-center mb-4">
                  <FiUsers className="mr-2 text-blue-700" /> Datos del Representante
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Nombre Completo *</label>
                    <input {...register('representativeFullName', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Cédula de Identidad *</label>
                    <input {...register('representativeIdentityCard', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Dirección *</label>
                    <input {...register('representativeAddress', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Teléfono *</label>
                    <input {...register('representativePhone', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Relación con el estudiante *</label>
                    <input {...register('relationship', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Nombre del Padre/Madre</label>
                    <input {...register('parentName')} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Cédula Padre/Madre</label>
                    <input {...register('parentIdentityCard')} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Teléfono Padre/Madre</label>
                    <input {...register('parentPhone')} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
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
                <button type="submit" disabled={loading}
                  className="bg-blue-800 text-white px-8 py-3 rounded-lg hover:bg-blue-900 transition font-semibold disabled:opacity-50">
                  {loading ? 'Registrando...' : 'Crear cuenta y enviar código'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ------------------------------------------------------ */}
        {/* PASO 2 – VERIFICACIÓN DE CÓDIGO                       */}
        {/* ------------------------------------------------------ */}
        {step === 'verify' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <FiMail className="mx-auto h-16 w-16 text-blue-800 mb-4" />
            <h2 className="text-3xl font-bold mb-4">Verifica tu correo</h2>
            <p className="text-lg mb-6">
              Hemos enviado un código de 5 dígitos a <strong>{registeredEmail}</strong>.
              Introdúcelo para continuar.
            </p>
            <input
              type="text"
              maxLength={5}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Código de 5 dígitos"
              className="text-2xl py-3 px-4 border-2 border-gray-300 rounded-lg text-center mb-4"
            />
            <button
              onClick={() => handleVerify(verificationCode)}
              disabled={loading || verificationCode.length !== 5}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>
            <p className="mt-4 text-sm text-gray-500">
              ¿No recibiste el código? Revisa la carpeta de spam.
            </p>
          </motion.div>
        )}

        {/* ------------------------------------------------------ */}
        {/* PASO 3 – ÉXITO Y PLANILLA IMPRIMIBLE                 */}
        {/* ------------------------------------------------------ */}
        {step === 'success' && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
            <FiPrinter className="mx-auto h-20 w-20 text-green-500 mb-6 no-print" />
            <h2 className="text-3xl font-bold text-slate-800 mb-4 no-print">¡Correo verificado!</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto no-print">
              Tu cuenta ha sido creada (aún inactiva hasta la entrevista).
              Ahora puedes imprimir la planilla con tus datos. Recuerda llevarla a la entrevista presencial.
            </p>

            {/* Área de impresión optimizada */}
            <div id="print-area" className="hidden print:block text-left mx-auto max-w-full">
              {formDataForPDF && (
                <div className="avoid-break">
                  <div className="text-center mb-4">
                    <img src="/logo.png" alt="Logo" className="mx-auto h-20 mb-2" />
                    <h1 className="text-xl font-bold">PLANILLA DE SOLICITUD DE INSCRIPCIÓN</h1>
                    <p className="text-sm">U.E. José Antonio Abreu - Naguanagua</p>
                    <p className="text-sm">Fecha: {new Date().toLocaleDateString()}</p>
                  </div>

                  <div className="flex flex-row gap-4">
                    {/* Columna izquierda – Representante */}
                    <div className="flex-1 avoid-break">
                      <h3 className="font-bold underline mb-2">1. DATOS DEL REPRESENTANTE</h3>
                      <table className="w-full text-xs">
                        <tbody>
                          <tr><td className="font-semibold pr-2">Nombre y Apellido:</td><td>{formDataForPDF.representativeFullName}</td></tr>
                          <tr><td className="font-semibold pr-2">Cédula de Identidad:</td><td>{formDataForPDF.representativeIdentityCard}</td></tr>
                          <tr><td className="font-semibold pr-2">Dirección:</td><td>{formDataForPDF.representativeAddress}</td></tr>
                          <tr><td className="font-semibold pr-2">Teléfono:</td><td>{formDataForPDF.representativePhone}</td></tr>
                          <tr><td className="font-semibold pr-2">Relación con el estudiante:</td><td>{formDataForPDF.relationship}</td></tr>
                          <tr><td className="font-semibold pr-2">Nombre del Padre/Madre:</td><td>{formDataForPDF.parentName}</td></tr>
                          <tr><td className="font-semibold pr-2">Cédula Padre/Madre:</td><td>{formDataForPDF.parentIdentityCard}</td></tr>
                          <tr><td className="font-semibold pr-2">Teléfono Padre/Madre:</td><td>{formDataForPDF.parentPhone}</td></tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Columna derecha – Estudiantes */}
                    <div className="flex-1 avoid-break">
                      <h3 className="font-bold underline mb-2">2. DATOS DE LOS ESTUDIANTES</h3>
                      {formDataForPDF.students.map((est, idx) => (
                        <div key={idx} className="mb-2 avoid-break">
                          <p className="font-semibold text-sm">Estudiante {idx + 1}</p>
                          <table className="w-full text-xs">
                            <tbody>
                              <tr><td className="font-semibold pr-2">Nombre:</td><td>{est.fullName}</td></tr>
                              <tr><td className="font-semibold pr-2">Cédula:</td><td>{est.identityCard}</td></tr>
                              <tr><td className="font-semibold pr-2">Fecha Nac.:</td><td>{est.birthDate}</td></tr>
                              <tr><td className="font-semibold pr-2">Nacionalidad:</td><td>{est.nationality}</td></tr>
                              <tr><td className="font-semibold pr-2">País Nac.:</td><td>{est.birthCountry}</td></tr>
                              <tr><td className="font-semibold pr-2">Estado:</td><td>{est.state}</td></tr>
                              <tr><td className="font-semibold pr-2">Zona:</td><td>{est.zone}</td></tr>
                              <tr><td className="font-semibold pr-2">Dirección:</td><td>{est.addressDescription}</td></tr>
                              <tr><td className="font-semibold pr-2">Teléfono:</td><td>{est.phone}</td></tr>
                              <tr><td className="font-semibold pr-2">Emergencia:</td><td>{est.emergencyContact}</td></tr>
                              <tr><td className="font-semibold pr-2">Tel. Emerg.:</td><td>{est.emergencyPhone}</td></tr>
                              <tr><td className="font-semibold pr-2">Alergias:</td><td>{est.hasAllergies ? est.allergiesDescription : 'No'}</td></tr>
                              <tr><td className="font-semibold pr-2">Enfermedades:</td><td>{est.hasDiseases ? est.diseasesDescription : 'No'}</td></tr>
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center font-bold text-red-600 mt-4 avoid-break">
                    IMPORTANTE: Debe presentar esta planilla en la entrevista presencial.
                  </div>
                </div>
              )}
            </div>

            <button onClick={handlePrint}
              className="no-print bg-green-600 text-white px-10 py-4 rounded-lg hover:bg-green-700 transition font-bold text-lg flex items-center justify-center mx-auto shadow-lg mt-8">
              <FiPrinter className="mr-2" /> Imprimir / Descargar PDF
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SolicitudInscripcion;