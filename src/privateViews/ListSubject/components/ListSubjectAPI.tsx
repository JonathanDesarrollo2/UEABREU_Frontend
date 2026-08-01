import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  FaEdit, 
  FaTrash, 
  FaChalkboardTeacher,
  FaClock
} from 'react-icons/fa';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';
import type { TypeSubject } from '../../../types/subject';
import { useDeleteSubject } from '../../../hooks/teacher/useDeteleSubject';
import GenericModal from '../../../components/GenricModal';

interface ListSubjectsAPIProps {
  data: TypeSubject[];
}

export default function ListSubjectsAPI({ data }: ListSubjectsAPIProps) {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<TypeSubject | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string, subjectName: string } | null>(null);
  
  const { mutate: deleteSubject, isPending: isDeleting } = useDeleteSubject();

  const handleDelete = () => {
    if (deleteCandidate) {
      deleteSubject(deleteCandidate.id, {
        onSuccess: () => {
          setDeleteCandidate(null);
          setSelectedSubject(null);
        }
      });
    }
  };

  const handleUpdate = (subject: TypeSubject) => {
    navigate('/admin/subjects/edit', { state: { subjectData: subject } });
  };

  const getSubjectTypeText = (type?: string) => {
    switch(type) {
      case 'ordinaria': return 'Ordinaria';
      case 'regular': return 'Regular';
      case 'complementaria_obligatoria': return 'Complementaria Obligatoria';
      case 'complementaria_opcional': return 'Complementaria Opcional';
      default: return type || 'No especificado';
    }
  };

  return (
    <>
      {/* Tabla de materias */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left border-b">Código</th>
              <th className="py-3 px-4 text-left border-b">Nombre</th>
              <th className="py-3 px-4 text-left border-b">Tipo</th>
              <th className="py-3 px-4 text-left border-b">Horas/Semana</th>
              <th className="py-3 px-4 text-left border-b">Docente</th>
              <th className="py-3 px-4 text-left border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((subject) => (
              <tr 
                key={subject.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedSubject(subject)}
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-blue-600">{subject.code}</div>
                </td>
                <td className="py-3 px-4">{subject.name}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {getSubjectTypeText(subject.subjectType)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <FaClock className="mr-1 text-gray-500" />
                    {subject.hoursPerWeek} hrs
                  </div>
                </td>
                <td className="py-3 px-4">
                  {subject.teacher ? (
                    <div>
                      <div className="font-medium">{subject.teacher.fullName}</div>
                      <div className="text-sm text-gray-500">{subject.teacher.specialization}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">No asignado</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleUpdate(subject)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate({ 
                        id: subject.id!, 
                        subjectName: subject.name!
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

      {/* Modal de Detalles de la Materia */}
      {selectedSubject && (
        <GenericModal
          title={`Detalles de la Materia: ${selectedSubject.name}`}
          fields={[
            {
              label: 'Código',
              value: selectedSubject.code || 'No disponible',
              type: 'text'
            },
            {
              label: 'Nombre',
              value: selectedSubject.name || 'No disponible',
              type: 'text'
            },
            {
              label: 'Tipo',
              value: getSubjectTypeText(selectedSubject.subjectType),
              type: 'text'
            },
            {
              label: 'Horas por Semana',
              value: `${selectedSubject.hoursPerWeek || 0} horas`,
              type: 'text'
            },
            {
              label: 'Horas Teóricas',
              value: `${selectedSubject.theoreticalHours || 0} horas`,
              type: 'text'
            },
            {
              label: 'Horas de Laboratorio',
              value: `${selectedSubject.labHours || 0} horas`,
              type: 'text'
            }
          ]}
          extraContent={
            selectedSubject.teacher && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-3 flex items-center">
                  <FaChalkboardTeacher className="mr-2" /> Información del Docente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nombre Completo:</label>
                    <p className="text-gray-800">{selectedSubject.teacher.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Especialización:</label>
                    <p className="text-gray-800">{selectedSubject.teacher.specialization || 'No especificada'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email:</label>
                    <p className="text-gray-800">{selectedSubject.teacher.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Teléfono:</label>
                    <p className="text-gray-800">{selectedSubject.teacher.phone}</p>
                  </div>
                </div>
              </div>
            )
          }
          show={!!selectedSubject}
          onClose={() => setSelectedSubject(null)}
          onEdit={() => {
            handleUpdate(selectedSubject);
            setSelectedSubject(null);
          }}
          onDelete={() => {
            setDeleteCandidate({ 
              id: selectedSubject.id!, 
              subjectName: selectedSubject.name!
            });
            setSelectedSubject(null);
          }}
          onCancel={() => setSelectedSubject(null)}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDeleteModal
        show={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro que deseas eliminar la materia "${deleteCandidate?.subjectName}"? Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
      />
    </>
  );
}