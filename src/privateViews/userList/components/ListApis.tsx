// src/views/admin/users/components/ListAPI.tsx
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  FaEdit, 
  FaTrash, 
  FaUser,
  FaUserTie,
  FaMoneyBillWave,
  FaUsers,
  FaCalendarAlt,
  FaSignInAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import type { TypeUser_full } from '../../../types/user';
import { useDeleteUser } from '../hooks/useDeleteUser';
import GenericModal from '../../../components/GenricModal';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';
import api from '../../../library/axios';

interface ListAPIProps {
  data: TypeUser_full[];
}

export default function ListAPIs({ data }: ListAPIProps) {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<TypeUser_full | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string; userlogin: string } | null>(null);
  const [impersonating, setImpersonating] = useState(false);
  
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const handleDelete = () => {
    if (deleteCandidate) {
      deleteUser(deleteCandidate, {
        onSuccess: () => {
          setDeleteCandidate(null);
          setSelectedUser(null);
        }
      });
    }
  };

  const handleUpdate = (user: TypeUser_full) => {
    navigate('/admin/users/edit', { state: { userData: user } });
  };

  const handleImpersonate = async () => {
    if (!selectedUser) return;
    setImpersonating(true);
    try {
      const { data } = await api.post(`/private/user/impersonate/${selectedUser.id}`);
      if (data.result) {
        const { token } = data.content;
        localStorage.setItem('tokcattleraising_inCattleRanchCloud', token);
        toast.success(`Sesión iniciada como ${selectedUser.userlogin}`);
        // Redirigir según nivel
        if (selectedUser.nivel === 1) {
          navigate('/representante'); // Ajusta la ruta del panel de representante
        } else {
          navigate('/admin/dashboard'); // O dashboard de admin
        }
        setSelectedUser(null);
      } else {
        toast.error(data.error?.[0] || 'Error al iniciar sesión como este usuario');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.[0] || 'Error de conexión');
    } finally {
      setImpersonating(false);
    }
  };

  const getNivelText = (nivel?: number) => {
    switch(nivel) {
      case 1: return { text: 'Representante', icon: <FaUserTie className="inline mr-1" />, color: 'text-green-600' };
      case 2: return { text: 'Administrativo', icon: <FaUser className="inline mr-1" />, color: 'text-blue-600' };
      default: return { text: `Nivel ${nivel}`, icon: <FaUser className="inline mr-1" />, color: 'text-gray-600' };
    }
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'No disponible';
    return new Date(date).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <>
      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left border-b">Email</th>
              <th className="py-3 px-4 text-left border-b">Login</th>
              <th className="py-3 px-4 text-left border-b">Nombre</th>
              <th className="py-3 px-4 text-left border-b">Nivel</th>
              <th className="py-3 px-4 text-left border-b">Estado</th>
              <th className="py-3 px-4 text-left border-b">Registro</th>
              <th className="py-3 px-4 text-left border-b">Saldo</th>
              <th className="py-3 px-4 text-left border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => {
              const nivelInfo = getNivelText(user.nivel);
              const balanceInfo = user.representative?.balanceStatus;
              
              return (
                <tr 
                  key={user.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-blue-600">{user.usermail}</div>
                  </td>
                  <td className="py-3 px-4">{user.userlogin}</td>
                  <td className="py-3 px-4">{user.username || 'No asignado'}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${nivelInfo.color}`}>
                      {nivelInfo.icon} {nivelInfo.text}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.userstatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.userstatus ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    {user.nivel === 1 && user.representative ? (
                      <div className="flex items-center">
                        <FaMoneyBillWave className={`mr-1 ${balanceInfo === 'debt' ? 'text-red-500' : balanceInfo === 'credit' ? 'text-green-500' : 'text-gray-500'}`} />
                        <span className={`font-semibold ${balanceInfo === 'debt' ? 'text-red-600' : balanceInfo === 'credit' ? 'text-green-600' : 'text-gray-600'}`}>
                          {user.representative.balanceFormatted || 'Bs 0,00'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleUpdate(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate({ id: user.id!, userlogin: user.userlogin! })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles del Usuario */}
      {selectedUser && (
        <GenericModal
          title={`Detalles del Usuario: ${selectedUser.userlogin}`}
          fields={[
            {
              label: 'Email',
              value: selectedUser.usermail || 'No disponible',
              type: 'text'
            },
            {
              label: 'Login',
              value: selectedUser.userlogin || 'No disponible',
              type: 'text'
            },
            {
              label: 'Nombre',
              value: selectedUser.username || 'No asignado',
              type: 'text'
            },
            {
              label: 'Nivel',
              value: getNivelText(selectedUser.nivel).text,
              type: 'text'
            },
            {
              label: 'Estado',
              value: selectedUser.userstatus ? 'Activo' : 'Inactivo',
              type: 'text'
            },
            {
              label: 'Fecha de Registro',
              value: formatDate(selectedUser.createdAt),
              type: 'text'
            }
          ]}
          extraContent={
            <>
              {/* Botón de suplantación */}
              <div className="mt-4 mb-4">
                <button
                  onClick={handleImpersonate}
                  disabled={impersonating}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <FaSignInAlt className="text-lg" />
                  {impersonating ? 'Iniciando sesión...' : 'Entrar como este usuario'}
                </button>
              </div>

              {selectedUser.nivel === 1 && selectedUser.representative ? (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-lg mb-3 flex items-center">
                    <FaUserTie className="mr-2" /> Información del Representante
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Nombre Completo:</label>
                      <p className="text-gray-800">{selectedUser.representative.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Cédula:</label>
                      <p className="text-gray-800">{selectedUser.representative.identityCard}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Teléfono:</label>
                      <p className="text-gray-800">{selectedUser.representative.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Relación:</label>
                      <p className="text-gray-800">{selectedUser.representative.relationship}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">Dirección:</label>
                      <p className="text-gray-800">{selectedUser.representative.address}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">Saldo Actual:</label>
                      <p className={`text-xl font-bold ${selectedUser.representative.balanceStatus === 'debt' ? 'text-red-600' : selectedUser.representative.balanceStatus === 'credit' ? 'text-green-600' : 'text-gray-600'}`}>
                        {selectedUser.representative.balanceFormatted || 'Bs 0,00'}
                      </p>
                    </div>
                  </div>

                  {/* Lista de Estudiantes */}
                  {selectedUser.representative.students && selectedUser.representative.students.length > 0 && (
                    <div>
                      <h5 className="font-bold mb-2 flex items-center">
                        <FaUsers className="mr-2" /> Estudiantes ({selectedUser.representative.students.length})
                      </h5>
                      <div className="space-y-3 max-h-72 overflow-y-auto">
                        {selectedUser.representative.students.map((student) => {
                          const studentAny = student as any;
                          return (
                            <div 
                              key={student.id} 
                              className="p-4 border rounded-lg bg-white hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => setSelectedStudent(studentAny)}
                            >
                              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                                <div>
                                  <p className="font-medium text-gray-900">{student.fullName}</p>
                                  <p className="text-sm text-gray-600">Cédula: {student.identityCard}</p>
                                  <p className="text-sm text-gray-600 flex items-center">
                                    <FaCalendarAlt className="mr-1 text-gray-400" />
                                    Admisión: {formatDate(studentAny.admissionDate)}
                                  </p>
                                </div>
                                <div className="md:text-right">
                                  <span className={`inline-block px-2 py-1 rounded text-xs mb-1 ${student.status === 'regular' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {student.status || 'pendiente'}
                                  </span>
                                  <p className={`text-sm font-semibold ${studentAny.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    Saldo: {formatCurrency(studentAny.balance || 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedUser.nivel === 1 ? (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-700">Este usuario es nivel 1 (Representante) pero no tiene información de representante registrada.</p>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-700">Usuario administrativo.</p>
                </div>
              )}
            </>
          }
          show={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={() => {
            handleUpdate(selectedUser);
            setSelectedUser(null);
          }}
          onDelete={() => {
            setDeleteCandidate({ id: selectedUser.id!, userlogin: selectedUser.userlogin! });
            setSelectedUser(null);
          }}
          onCancel={() => setSelectedUser(null)}
        />
      )}

      {/* Modal de Detalles del Estudiante */}
      {selectedStudent && (
        <GenericModal
          title={`Detalles del Estudiante: ${selectedStudent.fullName}`}
          fields={[
            {
              label: 'Nombre Completo',
              value: selectedStudent.fullName || 'No disponible',
              type: 'text'
            },
            {
              label: 'Cédula',
              value: selectedStudent.identityCard || 'No disponible',
              type: 'text'
            },
            {
              label: 'Estado Académico',
              value: selectedStudent.status ? selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1) : 'Pendiente',
              type: 'text'
            },
            {
              label: 'Grado Actual',
              value: selectedStudent.currentGrade || 'En asignar',
              type: 'text'
            },
            {
              label: 'Sección',
              value: selectedStudent.section || 'Pendiente',
              type: 'text'
            },
            {
              label: 'Contacto de Emergencia',
              value: selectedStudent.emergencyContact || 'No disponible',
              type: 'text'
            },
            {
              label: 'Teléfono de Emergencia',
              value: selectedStudent.emergencyPhone || 'No disponible',
              type: 'text'
            }
          ]}
          extraContent={
            <>
              {selectedStudent.birthDate && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <label className="block text-sm font-medium text-gray-600">Fecha de Nacimiento:</label>
                  <p className="text-gray-800">
                    {new Date(selectedStudent.birthDate).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {selectedStudent.admissionDate && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <label className="block text-sm font-medium text-gray-600">Fecha de Admisión:</label>
                  <p className="text-gray-800">{formatDate(selectedStudent.admissionDate)}</p>
                </div>
              )}
              {selectedStudent.balance !== undefined && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <label className="block text-sm font-medium text-gray-600">Saldo del Estudiante:</label>
                  <p className={`text-lg font-semibold ${selectedStudent.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(selectedStudent.balance)}
                  </p>
                </div>
              )}
            </>
          }
          show={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onCancel={() => setSelectedStudent(null)}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDeleteModal
        show={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro que deseas eliminar al usuario "${deleteCandidate?.userlogin}"? Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
      />
    </>
  );
  
}