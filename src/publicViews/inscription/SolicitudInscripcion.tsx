import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { FiUsers, FiClipboard, FiPrinter, FiMail, FiEye, FiEyeOff, FiFileText } from 'react-icons/fi';
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
  previousSchool: string;
  municipality: string;
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
// Datos de prueba realistas (2 estudiantes)
// ------------------------------------------------------
const MOCK_DATA: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
  userlogin: '',
  representativeFullName: 'María Gabriela Rodríguez',
  representativeIdentityCard: 'V-12.345.678',
  representativeAddress: 'Calle Bolívar, Edif. Los Sauces, Piso 2, Apto. 4',
  representativePhone: '0412-111.22.33',
  relationship: 'Madre',
  parentName: 'Carlos Eduardo Pérez',
  parentIdentityCard: 'V-9.876.543',
  parentPhone: '0414-555.66.77',
  students: [
    {
      fullName: 'Luis Fernando Pérez Rodríguez',
      identityCard: 'V-28.111.222',
      birthDate: '2015-03-12',
      nationality: 'Venezolano',
      birthCountry: 'Venezuela',
      state: 'Guárico',
      zone: 'Zona Centro',
      addressDescription: 'Av. Las Palmas, Casa N° 34, al lado de la farmacia',
      phone: '0416-123.45.67',
      emergencyContact: 'María Rodríguez (madre)',
      emergencyPhone: '0412-111.22.33',
      hasAllergies: true,
      allergiesDescription: 'Alergia a la penicilina',
      hasDiseases: false,
      diseasesDescription: '',
      previousSchool: 'U.E. "Juan Germán Roscio"',
      municipality: 'Leonardo Infante',
    },
    {
      fullName: 'Ana Valentina Pérez Rodríguez',
      identityCard: 'V-30.555.888',
      birthDate: '2018-07-25',
      nationality: 'Venezolana',
      birthCountry: 'Venezuela',
      state: 'Guárico',
      zone: 'Zona Centro',
      addressDescription: 'Av. Las Palmas, Casa N° 34, al lado de la farmacia',
      phone: '',
      emergencyContact: 'María Rodríguez (madre)',
      emergencyPhone: '0412-111.22.33',
      hasAllergies: false,
      allergiesDescription: '',
      hasDiseases: false,
      diseasesDescription: '',
      previousSchool: 'Preescolar "Mi Pequeño Mundo"',
      municipality: 'Leonardo Infante',
    },
  ],
};

// ------------------------------------------------------
// Componente principal
// ------------------------------------------------------
const SolicitudInscripcion: React.FC = () => {
  const { step, loading, registeredEmail, planillaNumber, handleRegister, handleVerify } = usePublicRegistration();

  const [formDataForPDF, setFormDataForPDF] = useState<FormData | null>(null);
  const [pdfPlanillaNumber, setPdfPlanillaNumber] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, control } = useForm<FormData>({
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
        hasDiseases: false, diseasesDescription: '', previousSchool: '', municipality: ''
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'students' });

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

  const generateLogin = () => 'Rep' + Math.floor(1000 + Math.random() * 9000);

  const calcularEdad = (fecha: string): number | string => {
    if (!fecha) return '';
    const hoy = new Date();
    const nac = new Date(fecha);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) {
      edad--;
    }
    return edad;
  };

  const addStudent = () => {
    append({
      fullName: '', identityCard: '', birthDate: '', nationality: '', birthCountry: '',
      state: '', zone: '', addressDescription: '', phone: '', emergencyContact: '',
      emergencyPhone: '', hasAllergies: false, allergiesDescription: '',
      hasDiseases: false, diseasesDescription: '', previousSchool: '', municipality: ''
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
          previousSchool: s.previousSchool || '',
          municipality: s.municipality || '',
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

  // ============ NUEVA FUNCIÓN: Generar PDF de prueba ============
  const handleTestPrint = useCallback(() => {
    setFormDataForPDF(MOCK_DATA);
    setPdfPlanillaNumber(9999); // número de prueba
    // Pequeño retraso para asegurar que React renderice el área de impresión
    setTimeout(() => {
      window.print();
    }, 100);
  }, []);

  // Estados de carga / inscripciones cerradas
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

  // Determina qué datos se muestran en el PDF (prueba o real)
  const pdfData = formDataForPDF;
  const displayPlanillaNumber = pdfPlanillaNumber ?? planillaNumber;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
      {/* Estilos de impresión */}
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body, html { margin: 0; padding: 0; width: 100%; height: auto; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0; background: white; }
          .no-print { display: none !important; }
          .avoid-break { page-break-inside: avoid; }
        }
        .required-asterisk { color: red; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
      >
        {/* ------------------------------------------------------ */}
        {/* PASO 1 – FORMULARIO */}
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
              
              {/* Botón de PDF de prueba */}
              <div className="mt-6">
                <button
                  onClick={handleTestPrint}
                  className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition font-semibold shadow-md"
                >
                  <FiFileText /> Generar PDF de prueba (2 estudiantes)
                </button>
                <p className="text-xs text-slate-500 mt-2">
                  Crea una planilla de ejemplo para ver cómo quedará impresa.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Cuenta */}
              <div className="bg-white rounded-xl p-6 border border-slate-300">
                <h2 className="text-xl font-bold text-slate-800 flex items-center mb-4">
                  <FiMail className="mr-2 text-blue-700" /> Datos de la cuenta
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Correo Electrónico <span className="required-asterisk">*</span>
                    </label>
                    <input type="email" {...register('email', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Usuario (opcional, se asigna automáticamente)
                    </label>
                    <input {...register('userlogin')} placeholder="Ej: Rep1234" className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Contraseña <span className="required-asterisk">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', { required: true, minLength: 6 })}
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Confirmar Contraseña <span className="required-asterisk">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword', { required: true })}
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm pr-10"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
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
                    <label className="block text-sm font-medium text-slate-700">
                      Nombre Completo <span className="required-asterisk">*</span>
                    </label>
                    <input {...register('representativeFullName', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Cédula de Identidad <span className="required-asterisk">*</span>
                    </label>
                    <input {...register('representativeIdentityCard', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Dirección <span className="required-asterisk">*</span>
                    </label>
                    <input {...register('representativeAddress', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Teléfono <span className="required-asterisk">*</span>
                    </label>
                    <input {...register('representativePhone', { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Relación con el estudiante <span className="required-asterisk">*</span>
                    </label>
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

              {/* Solicitantes */}
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <FiUsers className="mr-2 text-blue-700" /> Solicitantes
                  </h2>
                  <button type="button" onClick={addStudent}
                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition">
                    + Agregar Solicitante
                  </button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="border border-slate-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-slate-700">Solicitante #{index + 1}</h3>
                      {index > 0 && (
                        <button type="button" onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Nombre Completo <span className="required-asterisk">*</span>
                        </label>
                        <input {...register(`students.${index}.fullName`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Cédula <span className="required-asterisk">*</span>
                        </label>
                        <input {...register(`students.${index}.identityCard`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Fecha de Nacimiento <span className="required-asterisk">*</span>
                        </label>
                        <input type="date" {...register(`students.${index}.birthDate`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Nacionalidad <span className="required-asterisk">*</span>
                        </label>
                        <input {...register(`students.${index}.nationality`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          País de Nacimiento <span className="required-asterisk">*</span>
                        </label>
                        <input {...register(`students.${index}.birthCountry`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Estado <span className="required-asterisk">*</span>
                        </label>
                        <input {...register(`students.${index}.state`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Zona donde vive <span className="required-asterisk">*</span>
                        </label>
                        <input {...register(`students.${index}.zone`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Municipio</label>
                        <input {...register(`students.${index}.municipality`)} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Escuela de Procedencia</label>
                        <input {...register(`students.${index}.previousSchool`)} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Dirección Completa <span className="required-asterisk">*</span>
                        </label>
                        <textarea {...register(`students.${index}.addressDescription`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" rows={2}></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                        <input {...register(`students.${index}.phone`)} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Contacto de Emergencia <span className="required-asterisk">*</span>
                        </label>
                        <input {...register(`students.${index}.emergencyContact`, { required: true })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Teléfono Emergencia <span className="required-asterisk">*</span>
                        </label>
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

        {/* PASO 2 – VERIFICACIÓN */}
        {step === 'verify' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <FiMail className="mx-auto h-16 w-16 text-blue-800 mb-4" />
            <h2 className="text-3xl font-bold mb-4">Verifica tu correo</h2>
            <p className="text-lg mb-6">
              Hemos enviado un código de 5 dígitos a <strong>{registeredEmail}</strong>.
              Introdúcelo para continuar.
            </p>
            <input
              type="text" maxLength={5} value={verificationCode}
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

        {/* PASO 3 – ÉXITO */}
        {step === 'success' && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
            <FiPrinter className="mx-auto h-20 w-20 text-green-500 mb-6 no-print" />
            <h2 className="text-3xl font-bold text-slate-800 mb-4 no-print">¡Correo verificado!</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto no-print">
              Tu cuenta ha sido creada (aún inactiva hasta la entrevista).
              Ahora puedes imprimir la planilla con tus datos. Recuerda llevarla a la entrevista presencial.
            </p>
            <button onClick={handlePrint}
              className="no-print bg-green-600 text-white px-10 py-4 rounded-lg hover:bg-green-700 transition font-bold text-lg flex items-center justify-center mx-auto shadow-lg mt-8">
              <FiPrinter className="mr-2" /> Imprimir / Descargar PDF
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Área de impresión SIEMPRE presente (oculta en pantalla, visible al imprimir) */}
      <div id="print-area" className="hidden print:block text-left mx-auto max-w-full">
        {pdfData && (
          <div className="avoid-break">
            <div className="text-center mb-4">
              <img src="/logo.png" alt="Logo" className="mx-auto h-20 mb-2" />
              <h1 className="text-xl font-bold">PLANILLA DE SOLICITUD DE INSCRIPCIÓN</h1>
              <p className="text-sm">U.E. José Antonio Abreu - Naguanagua</p>
              <p className="text-sm"><strong>N° de Planilla:</strong> {displayPlanillaNumber ?? '—'}</p>
              <p className="text-sm">Fecha: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="flex flex-row gap-4">
              {/* Representante */}
              <div className="flex-1 avoid-break">
                <h3 className="font-bold underline mb-2">1. DATOS DEL REPRESENTANTE</h3>
                <table className="w-full text-xs">
                  <tbody>
                    <tr><td className="font-semibold pr-2">Nombre y Apellido:</td><td>{pdfData.representativeFullName}</td></tr>
                    <tr><td className="font-semibold pr-2">Cédula de Identidad:</td><td>{pdfData.representativeIdentityCard}</td></tr>
                    <tr><td className="font-semibold pr-2">Dirección:</td><td>{pdfData.representativeAddress}</td></tr>
                    <tr><td className="font-semibold pr-2">Teléfono:</td><td>{pdfData.representativePhone}</td></tr>
                    <tr><td className="font-semibold pr-2">Relación con el estudiante:</td><td>{pdfData.relationship}</td></tr>
                    <tr><td className="font-semibold pr-2">Nombre del Padre/Madre:</td><td>{pdfData.parentName || '-'}</td></tr>
                    <tr><td className="font-semibold pr-2">Cédula Padre/Madre:</td><td>{pdfData.parentIdentityCard || '-'}</td></tr>
                    <tr><td className="font-semibold pr-2">Teléfono Padre/Madre:</td><td>{pdfData.parentPhone || '-'}</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Solicitantes */}
              <div className="flex-1 avoid-break">
                <h3 className="font-bold underline mb-2">2. DATOS DE LOS SOLICITANTES</h3>
                {pdfData.students.map((est, idx) => (
                  <div key={idx} className="mb-2 avoid-break">
                    <p className="font-semibold text-sm">Solicitante {idx + 1}</p>
                    <table className="w-full text-xs">
                      <tbody>
                        <tr><td className="font-semibold pr-2">Nombre:</td><td>{est.fullName}</td></tr>
                        <tr><td className="font-semibold pr-2">Edad:</td><td>{calcularEdad(est.birthDate)}</td></tr>
                        <tr><td className="font-semibold pr-2">Fecha Nac.:</td><td>{est.birthDate}</td></tr>
                        <tr><td className="font-semibold pr-2">Nacionalidad:</td><td>{est.nationality}</td></tr>
                        <tr><td className="font-semibold pr-2">País Nac.:</td><td>{est.birthCountry}</td></tr>
                        <tr><td className="font-semibold pr-2">Estado:</td><td>{est.state}</td></tr>
                        <tr><td className="font-semibold pr-2">Zona donde vive:</td><td>{est.zone}</td></tr>
                        <tr><td className="font-semibold pr-2">Municipio:</td><td>{est.municipality || '-'}</td></tr>
                        <tr><td className="font-semibold pr-2">Escuela de procedencia:</td><td>{est.previousSchool || '-'}</td></tr>
                        <tr><td className="font-semibold pr-2">Dirección:</td><td>{est.addressDescription}</td></tr>
                        <tr><td className="font-semibold pr-2">Teléfono:</td><td>{est.phone || '-'}</td></tr>
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

            {/* Firmas y nota */}
            <div className="mt-8 avoid-break">
              <p className="text-sm mb-2 font-bold">Para uso del representante:</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p>_________________________</p>
                  <p>Firma del Representante</p>
                </div>
                <div>
                  <p>_________________________</p>
                  <p>Firma de quien recibe</p>
                </div>
                <div>
                  <p>_________________________</p>
                  <p>Sello</p>
                </div>
                <div>
                  <p>Fecha y hora: _______________</p>
                  <p>(Solo uso de la institución)</p>
                </div>
              </div>
            </div>

            <div className="text-center text-xs font-semibold mt-6 avoid-break border-t pt-2">
              Nota: Esta planilla nos da derecho a aprobación de cupo solamente, es un proceso de preinscripción.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudInscripcion;