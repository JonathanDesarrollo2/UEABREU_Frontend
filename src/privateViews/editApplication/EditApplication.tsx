import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';
import api from '../../library/axios';

const EditApplication: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    userlogin: '',
    representativeData: {
      fullName: '',
      identityCard: '',
      address: '',
      phone: '',
      relationship: '',
    },
    studentsData: [] as any[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/private/registrations/${id}/data`);
        if (data.result) {
          const app = data.content;
          setFormData({
            email: app.email,
            userlogin: '',
            representativeData: {
              fullName: app.representativeFullName,
              identityCard: app.representativeIdentityCard,
              address: app.representativeAddress,
              phone: app.representativePhone,
              relationship: app.relationship,
            },
            studentsData: app.students.map((st: any) => ({
              id: st.id, // puede no venir; si no, se agregará como nuevo
              fullName: st.fullName,
              identityCard: st.identityCard,
              birthDate: st.birthDate,
              nationality: st.nationality,
              birthCountry: st.birthCountry,
              state: st.state,
              zone: st.zone,
              addressDescription: st.addressDescription,
              phone: st.phone || '',
              emergencyContact: st.emergencyContact,
              emergencyPhone: st.emergencyPhone,
              currentGrade: st.aspiredGrade || 'En asignar',
              section: '',
            })),
          });
        }
      } catch (error) {
        toast.error('Error al cargar solicitud');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/private/registrations/${id}/update`, formData);
      toast.success('Solicitud actualizada');
      navigate('/admin/registrations');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.[0] || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Editar Solicitud</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos de representante y estudiantes similar a EditUser */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold mb-4">Datos del Representante</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border rounded p-2" placeholder="Nombre completo" value={formData.representativeData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, representativeData: { ...prev.representativeData, fullName: e.target.value } }))} />
            <input className="border rounded p-2" placeholder="Cédula" value={formData.representativeData.identityCard} onChange={(e) => setFormData(prev => ({ ...prev, representativeData: { ...prev.representativeData, identityCard: e.target.value } }))} />
            <input className="border rounded p-2" placeholder="Teléfono" value={formData.representativeData.phone} onChange={(e) => setFormData(prev => ({ ...prev, representativeData: { ...prev.representativeData, phone: e.target.value } }))} />
            <input className="border rounded p-2" placeholder="Relación" value={formData.representativeData.relationship} onChange={(e) => setFormData(prev => ({ ...prev, representativeData: { ...prev.representativeData, relationship: e.target.value } }))} />
            <input className="border rounded p-2 col-span-2" placeholder="Dirección" value={formData.representativeData.address} onChange={(e) => setFormData(prev => ({ ...prev, representativeData: { ...prev.representativeData, address: e.target.value } }))} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold mb-4">Estudiantes</h3>
          {formData.studentsData.map((student, idx) => (
            <div key={idx} className="border rounded p-4 mb-4">
              <input className="border rounded p-2 w-full mb-2" placeholder="Nombre completo" value={student.fullName} onChange={(e) => {
                const updated = [...formData.studentsData];
                updated[idx].fullName = e.target.value;
                setFormData(prev => ({ ...prev, studentsData: updated }));
              }} />
              <input className="border rounded p-2 w-full mb-2" placeholder="Cédula" value={student.identityCard} onChange={(e) => {
                const updated = [...formData.studentsData];
                updated[idx].identityCard = e.target.value;
                setFormData(prev => ({ ...prev, studentsData: updated }));
              }} />
              <input className="border rounded p-2 w-full mb-2" type="date" placeholder="Fecha nacimiento" value={student.birthDate} onChange={(e) => {
                const updated = [...formData.studentsData];
                updated[idx].birthDate = e.target.value;
                setFormData(prev => ({ ...prev, studentsData: updated }));
              }} />
              <input className="border rounded p-2 w-full mb-2" placeholder="Grado" value={student.currentGrade} onChange={(e) => {
                const updated = [...formData.studentsData];
                updated[idx].currentGrade = e.target.value;
                setFormData(prev => ({ ...prev, studentsData: updated }));
              }} />
            </div>
          ))}
          <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setFormData(prev => ({ ...prev, studentsData: [...prev.studentsData, { fullName: '', identityCard: '', birthDate: '', currentGrade: 'En asignar' }] }))}>Agregar estudiante</button>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </motion.div>
  );
};

export default EditApplication;