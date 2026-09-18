import { useState } from 'react';
import { toast } from 'react-toastify';
import { createRepresentativeRegistration } from '../../apis/representativeRegistration';

export default function RepresentativeRegistration() {
  const [data, setData] = useState({ fullName: '', identityCard: '', birthDate: '', nationality: '', birthCountry: '', state: '', zone: '', addressDescription: '', phone: '', emergencyContact: '', emergencyPhone: '', previousSchool: '', municipality: '', aspiredGrade: '' });
  const update = (key: string, value: string) => setData(prev => ({ ...prev, [key]: value }));
  const submit = async (event: React.FormEvent) => { event.preventDefault(); const res = await createRepresentativeRegistration(data); if (res.result) toast.success(`Solicitud enviada. Planilla ${res.content.planillaNumber}`); else toast.error(res.error?.[0]); };
  const fields = [['fullName', 'Nombre completo *'], ['identityCard', 'Cédula *'], ['birthDate', 'Fecha de nacimiento *'], ['nationality', 'Nacionalidad'], ['birthCountry', 'País de nacimiento'], ['state', 'Estado'], ['zone', 'Zona'], ['addressDescription', 'Dirección'], ['phone', 'Teléfono'], ['emergencyContact', 'Contacto de emergencia'], ['emergencyPhone', 'Teléfono de emergencia'], ['previousSchool', 'Escuela de procedencia'], ['municipality', 'Municipio'], ['aspiredGrade', 'Año al que aspira']];
  return <form onSubmit={submit} className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6"><h1 className="text-2xl font-bold mb-5">Inscripciones</h1><p className="mb-5 text-gray-600">Solicita cupo para un nuevo estudiante asociado a tu cuenta.</p><div className="grid md:grid-cols-2 gap-4">{fields.map(([key, label]) => <label key={key} className="text-sm font-semibold text-gray-700">{label}<input type={key === 'birthDate' ? 'date' : 'text'} required={label.includes('*')} value={data[key as keyof typeof data]} onChange={e => update(key, e.target.value)} className="mt-1 w-full border rounded p-2" /></label>)}</div><button className="mt-6 bg-blue-600 text-white px-5 py-2 rounded">Enviar solicitud</button></form>;
}
