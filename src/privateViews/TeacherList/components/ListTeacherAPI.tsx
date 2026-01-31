import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  FaEdit, 
  FaTrash, 
  FaEnvelope,
  FaPhone,
  FaUserTie
} from 'react-icons/fa';
import type { TypeTeacher } from '../../../types/teacher';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';
import { useDeleteTeacher } from '../hooks/useDeleteTeacher';
import GenericModal from '../../../components/GenricModal';

interface ListTeachersAPIProps {
  data: TypeTeacher[];
}

export default function ListTeachersAPI({ data }: ListTeachersAPIProps) {
  const navigate = useNavigate();
  const [selectedTeacher, setSelectedTeacher] = useState<TypeTeacher | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string, teacherName: string } | null>(null);
  
  const { mutate: deleteTeacher, isPending: isDeleting } = useDeleteTeacher();

  const handleDelete = () => {
    if (deleteCandidate) {
      deleteTeacher(deleteCandidate.id, {
        onSuccess: () => {
          setDeleteCandidate(null);
          setSelectedTeacher(null);
        }
      });
    }
  };

  const handleUpdate = (teacher: TypeTeacher) => {
    navigate('/admin/teachers/edit', { state: { teacherData: teacher } });
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'No disponible';
    return new Date(date).toLocaleDateString('es-ES');
  };

  return (
    <>
      {/* Tabla de profesores */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left border-b">Nombre</th>
              <th className="py-3 px-4 text-left border-b">Cédula</th>
              <th className="py-3 px-4 text-left border-b">Email</th>
              <th className="py-3 px-4 text-left border-b">Teléfono</th>
              <th className="py-3 px-4 text-left border-b">Especialización</th>
              <th className="py-3 px-4 text-left border-b">Estado</th>
              <th className="py-3 px-4 text-left border-b">Registro</th>
              <th className="py-3 px-4 text-left border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((teacher) => (
              <tr 
                key={teacher.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedTeacher(teacher)}
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-blue-600">{teacher.fullName}</div>
                </td>
                <td className="py-3 px-4">{teacher.identityCard}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    {teacher.email}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <FaPhone className="mr-2 text-gray-400" />
                    {teacher.phone}
                  </div>
                </td>
                <td className="py-3 px-4">{teacher.specialization || 'No especificada'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${teacher.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {teacher.status ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {formatDate(teacher.createdAt)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleUpdate(teacher)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate({ 
                        id: teacher.id!, 
                        teacherName: teacher.fullName!
                      })}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles del Profesor */}
      {selectedTeacher && (
        <GenericModal
          title={`Detalles del Profesor: ${selectedTeacher.fullName}`}
          fields={[
            {
              label: 'Nombre Completo',
              value: selectedTeacher.fullName || 'No disponible',
              type: 'text'
            },
            {
              label: 'Cédula de Identidad',
              value: selectedTeacher.identityCard || 'No disponible',
              type: 'text'
            },
            {
              label: 'Email',
              value: selectedTeacher.email || 'No disponible',
              type: 'text'
            },
            {
              label: 'Teléfono',
              value: selectedTeacher.phone || 'No disponible',
              type: 'text'
            },
            {
              label: 'Dirección',
              value: selectedTeacher.address || 'No disponible',
              type: 'text'
            },
            {
              label: 'Especialización',
              value: selectedTeacher.specialization || 'No especificada',
              type: 'text'
            },
            {
              label: 'Título',
              value: selectedTeacher.degree || 'No especificado',
              type: 'text'
            },
            {
              label: 'Estado',
              value: selectedTeacher.status ? 'Activo' : 'Inactivo',
              type: 'text'
            }
          ]}
          extraContent={
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-lg mb-3 flex items-center">
                <FaUserTie className="mr-2" /> Información Adicional
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Comentarios:</label>
                  <p className="text-gray-800">{selectedTeacher.comments || 'Sin comentarios'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Clase/Grupo:</label>
                  <p className="text-gray-800">{selectedTeacher.class || 'No asignado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Fecha de Registro:</label>
                  <p className="text-gray-800">{formatDate(selectedTeacher.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Última Actualización:</label>
                  <p className="text-gray-800">{formatDate(selectedTeacher.updatedAt)}</p>
                </div>
              </div>
            </div>
          }
          show={!!selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          onEdit={() => {
            handleUpdate(selectedTeacher);
            setSelectedTeacher(null);
          }}
          onDelete={() => {
            setDeleteCandidate({ 
              id: selectedTeacher.id!, 
              teacherName: selectedTeacher.fullName!
            });
            setSelectedTeacher(null);
          }}
          onCancel={() => setSelectedTeacher(null)}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDeleteModal
        show={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro que deseas eliminar al profesor "${deleteCandidate?.teacherName}"? Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
      />
    </>
  );
}