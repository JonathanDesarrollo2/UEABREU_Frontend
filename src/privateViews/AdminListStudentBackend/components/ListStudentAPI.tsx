import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  FaEdit, 
  FaTrash, 
  FaUserTie,
} from 'react-icons/fa';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';
import type { TypeStudent } from '../../../types/student';
import { useDeleteStudent } from '../../../hooks/teacher/useDeteleStudent';
import GenericModal from '../../../components/GenricModal';

interface ListStudentsAPIProps {
  data: TypeStudent[];
}

export default function ListStudentsAPI({ data }: ListStudentsAPIProps) {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<TypeStudent | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<{ studentId: string, representativeId: string, studentName: string } | null>(null);
  
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();

  const handleDelete = () => {
    if (deleteCandidate) {
      deleteStudent(deleteCandidate, {
        onSuccess: () => {
          setDeleteCandidate(null);
          setSelectedStudent(null);
        }
      });
    }
  };

  const handleUpdate = (student: TypeStudent) => {
    navigate('/admin/students/edit', { state: { studentData: student } });
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'No disponible';
    return new Date(date).toLocaleDateString('es-ES');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'regular': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'repitiente': return 'bg-orange-100 text-orange-800';
      case 'condicionado': return 'bg-red-100 text-red-800';
      case 'inactivo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Tabla de estudiantes */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left border-b">Nombre</th>
              <th className="py-3 px-4 text-left border-b">Cédula</th>
              <th className="py-3 px-4 text-left border-b">Grado</th>
              <th className="py-3 px-4 text-left border-b">Sección</th>
              <th className="py-3 px-4 text-left border-b">Estado</th>
              <th className="py-3 px-4 text-left border-b">Fecha Admisión</th>
              <th className="py-3 px-4 text-left border-b">Representante</th>
              <th className="py-3 px-4 text-left border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((student) => (
              <tr 
                key={student.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-blue-600">{student.fullName}</div>
                </td>
                <td className="py-3 px-4">{student.identityCard}</td>
                <td className="py-3 px-4">{student.currentGrade || 'En asignar'}</td>
                <td className="py-3 px-4">{student.section || 'Pendiente'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.status)}`}>
                    {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'Pendiente'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {formatDate(student.admissionDate)}
                </td>
                <td className="py-3 px-4">
                  {student.representative ? (
                    <div>
                      <div className="font-medium">{student.representative.fullName}</div>
                      <div className="text-sm text-gray-500">{student.representative.identityCard}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">No asignado</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleUpdate(student)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate({ 
                        studentId: student.id!, 
                        representativeId: student.representativeId!,
                        studentName: student.fullName!
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
              label: 'Fecha de Nacimiento',
              value: selectedStudent.birthDate ? new Date(selectedStudent.birthDate).toLocaleDateString('es-ES') : 'No disponible',
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
              label: 'Estado Académico',
              value: selectedStudent.status ? selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1) : 'Pendiente',
              type: 'text'
            },
            {
              label: 'Fecha de Admisión',
              value: formatDate(selectedStudent.admissionDate),
              type: 'text'
            }
          ]}
          extraContent={
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-lg mb-3 flex items-center">
                <FaUserTie className="mr-2" /> Información del Representante
              </h4>
              {selectedStudent.representative ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nombre Completo:</label>
                    <p className="text-gray-800">{selectedStudent.representative.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Cédula:</label>
                    <p className="text-gray-800">{selectedStudent.representative.identityCard}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Teléfono:</label>
                    <p className="text-gray-800">{selectedStudent.representative.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Relación:</label>
                    <p className="text-gray-800">{selectedStudent.representative.relationship}</p>
                  </div>
                </div>
              ) : (
                <p className="text-yellow-600">No hay representante asignado</p>
              )}
            </div>
          }
          show={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onEdit={() => {
            handleUpdate(selectedStudent);
            setSelectedStudent(null);
          }}
          onDelete={() => {
            setDeleteCandidate({ 
              studentId: selectedStudent.id!, 
              representativeId: selectedStudent.representativeId!,
              studentName: selectedStudent.fullName!
            });
            setSelectedStudent(null);
          }}
          onCancel={() => setSelectedStudent(null)}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDeleteModal
        show={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro que deseas eliminar al estudiante "${deleteCandidate?.studentName}"? Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
      />
    </>
  );
}