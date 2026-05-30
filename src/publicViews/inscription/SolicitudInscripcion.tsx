import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import {  FiClipboard, FiPrinter, FiMail, FiFileText } from 'react-icons/fi';
import type { PublicRegisterPayload } from '../../types/publicRegistration';
import { toast } from 'react-toastify';
import { usePublicRegistration } from './hooks/usePublicRegistration';
import { MOCK_DATA } from './const/constants';
import AcuerdoModal from './components/Modal';
import FormularioSections from './components/FormSection';
import PrintTemplate from './components/PrintTemplate';
import type { InscripcionFormData } from '../../types/inscripcion';

const API_BASE = import.meta.env.VITE_API_BASE_LOCAL;

const SolicitudInscripcion: React.FC = () => {
  const { step, loading, registeredEmail, planillaNumber, handleRegister, handleVerify } = usePublicRegistration();

  const [formDataForPDF, setFormDataForPDF] = useState<InscripcionFormData | null>(null);
  const [pdfPlanillaNumber, setPdfPlanillaNumber] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acuerdoAceptado, setAcuerdoAceptado] = useState(false);
  const [showAcuerdo, setShowAcuerdo] = useState(false);

  const { register, handleSubmit, control } = useForm<InscripcionFormData>({
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
        hasDiseases: false, diseasesDescription: '', previousSchool: '', municipality: '',
        aspiredGrade: ''
      }]
    }
  });

  const { append } = useFieldArray({ control, name: 'students' });

  const addStudent = useCallback(() => {
    append({
      fullName: '', identityCard: '', birthDate: '', nationality: '', birthCountry: '',
      state: '', zone: '', addressDescription: '', phone: '', emergencyContact: '',
      emergencyPhone: '', hasAllergies: false, allergiesDescription: '',
      hasDiseases: false, diseasesDescription: '', previousSchool: '', municipality: '',
      aspiredGrade: ''
    });
  }, [append]);

  useEffect(() => {
    fetch(`${API_BASE}/public/registration-status`)
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

  const onSubmit = async (data: InscripcionFormData) => {
    if (!acuerdoAceptado) {
      toast.error('Debe aceptar el Acuerdo de Convivencia antes de continuar.');
      return;
    }
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
          currentGrade: s.aspiredGrade || 'En asignar',
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

  const handleTestPrint = useCallback(() => {
    setFormDataForPDF(MOCK_DATA);
    setPdfPlanillaNumber(9999);
    setTimeout(() => {
      window.print();
    }, 100);
  }, []);

  const aceptarAcuerdo = () => {
    setAcuerdoAceptado(true);
    setShowAcuerdo(false);
  };

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

  const pdfData = formDataForPDF;
  const displayPlanillaNumber = pdfPlanillaNumber ?? planillaNumber;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
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

      <AcuerdoModal
        isOpen={showAcuerdo}
        onClose={() => setShowAcuerdo(false)}
        onAccept={aceptarAcuerdo}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
      >
        {step === 'form' && (
          <>
            <div className="text-center mb-10">
              <FiClipboard className="mx-auto h-16 w-16 text-blue-800 mb-4" />
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Solicitud de Inscripción</h1>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Complete todos los datos. Recibirá un código de verificación en su correo.
                Su cuenta quedará pendiente de activación hasta la entrevista presencial.
              </p>
              
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

              <div className="mt-6">
                {!acuerdoAceptado ? (
                  <>
                    <button
                      onClick={() => setShowAcuerdo(true)}
                      className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition font-semibold shadow-md"
                    >
                      <FiFileText /> Leer Acuerdo de Convivencia
                    </button>
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      Debe leer y aceptar el Acuerdo de Convivencia para completar la inscripción.
                    </p>
                  </>
                ) : (
                  <div className="text-green-600 font-semibold mt-2 flex items-center justify-center gap-2">
                    <span>✔ Acuerdo de Convivencia aceptado</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <FormularioSections
                register={register}
                control={control}
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
                showConfirmPassword={showConfirmPassword}
                toggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
                addStudent={addStudent}
              />

              <div className="flex flex-col items-center">
                <button
                  type="submit"
                  disabled={loading || !acuerdoAceptado}
                  className={`bg-blue-800 text-white px-8 py-3 rounded-lg hover:bg-blue-900 transition font-semibold disabled:opacity-50 ${!acuerdoAceptado ? 'cursor-not-allowed' : ''}`}
                  title={!acuerdoAceptado ? 'Debe aceptar el Acuerdo de Convivencia' : ''}
                >
                  {loading ? 'Registrando...' : 'Crear cuenta y enviar código'}
                </button>
                {!acuerdoAceptado && (
                  <p className="text-red-600 text-sm mt-2">
                    * Debe leer y aceptar el Acuerdo de Convivencia antes de enviar el formulario.
                  </p>
                )}
              </div>
            </form>
          </>
        )}

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

      <PrintTemplate data={pdfData} planillaNumber={displayPlanillaNumber} calcularEdad={calcularEdad} />
    </div>
  );
};

export default SolicitudInscripcion;
