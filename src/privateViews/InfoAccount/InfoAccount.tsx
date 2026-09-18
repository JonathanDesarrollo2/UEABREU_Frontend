import { useEffect, useState } from 'react';
import { getAccountInfo, requestPasswordCode, resetPassword } from '../../apis/account';
import { toast } from 'react-toastify';

export default function InfoAccount() {
  const [account, setAccount] = useState<any>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [form, setForm] = useState({ code: '', newPassword: '', confirmPassword: '' });
  useEffect(() => { getAccountInfo().then((res) => res.result && setAccount(res.content)); }, []);
  const sendCode = async () => { const res = await requestPasswordCode(); if (res.result) { setCodeSent(true); toast.success(res.content.message); } else toast.error(res.error?.[0]); };
  const savePassword = async () => { const res = await resetPassword(form); if (res.result) { toast.success(res.content.message); setForm({ code: '', newPassword: '', confirmPassword: '' }); setCodeSent(false); } else toast.error(res.error?.[0]); };
  return <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 space-y-5">
    <h1 className="text-2xl font-bold">Información de la cuenta</h1>
    {account && <div className="space-y-2 text-gray-700"><p><b>Nombre:</b> {account.username}</p><p><b>Usuario:</b> {account.userlogin}</p><p><b>Correo:</b> {account.usermail}</p><p><b>Teléfono:</b> {account.phone || 'No registrado'}</p><p><b>Cédula:</b> {account.identityCard || 'No registrada'}</p></div>}
    <button onClick={sendCode} className="bg-blue-600 text-white px-4 py-2 rounded">Enviar código al correo</button>
    {codeSent && <div className="space-y-3 border-t pt-4"><input placeholder="Código recibido" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full border p-2 rounded" /><input type="password" placeholder="Nueva contraseña" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} className="w-full border p-2 rounded" /><input type="password" placeholder="Confirmar contraseña" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className="w-full border p-2 rounded" /><button onClick={savePassword} className="bg-green-600 text-white px-4 py-2 rounded">Actualizar contraseña</button></div>}
  </div>;
}
