import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from "react-toastify";
import { FaBook } from 'react-icons/fa';
import AnimatedPage from "../../components/AnimatedPage";
import { ActionButtons } from "../../components/ActionButtons";
import { FormField } from "../../components/FormField";
import { useUpdateSubject } from "./hooks/useUpdateSubject";
import { getActiveTeachersAPI } from "../../apis/teacher";
import type { TypeSubject } from "../../types/subject";

const SUBJECT_TYPE_OPTIONS = [
  { value: 'ordinaria', text: 'Ordinaria' },
  { value: 'regular', text: 'Regular' },
  { value: 'complementaria_obligatoria', text: 'Complementaria Obligatoria' },
  { value: 'complementaria_opcional', text: 'Complementaria Opcional' },
];

export default function EditSubjectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const subjectData = location.state?.subjectData as TypeSubject;

  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: subjectData || {
      id: '',
      name: '',
      code: '',
      hoursPerWeek: 0,
      theoreticalHours: 0,
      labHours: 0,
      subjectType: 'regular',
      teacherId: '',
      class: '',
      comments: '',
    },
  });

  const { mutate, isPending } = useUpdateSubject();

  useEffect(() => {
    if (!subjectData) {
      toast.error("No se encontraron datos de la materia");
      navigate('/admin/ListSubjects');
      return;
    }
    reset({
      id: subjectData.id,
      name: subjectData.name || '',
      code: subjectData.code || '',
      hoursPerWeek: subjectData.hoursPerWeek ?? 0,
      theoreticalHours: subjectData.theoreticalHours ?? 0,
      labHours: subjectData.labHours ?? 0,
      subjectType: subjectData.subjectType || 'regular',
      teacherId: subjectData.teacherId || subjectData.teacher?.id || '',
      class: subjectData.class || '',
      comments: subjectData.comments || '',
    });
  }, [subjectData, reset, navigate]);

  useEffect(() => {
    setIsLoadingTeachers(true);
    getActiveTeachersAPI()
      .then(response => {
        if (response.result && response.content) setTeachers(response.content);
      })
      .catch(() => toast.error('Error al cargar docentes'))
      .finally(() => setIsLoadingTeachers(false));
  }, []);

  const onSubmit = useCallback((formData: any) => {
    if (!formData.name?.trim()) return toast.error("El nombre es requerido");
    if (!formData.code?.trim()) return toast.error("El código es requerido");
    if (!formData.hoursPerWeek) return toast.error("Las horas por semana son requeridas");

    const payload = {
      id: subjectData.id,
      name: formData.name.trim(),
      code: formData.code.trim(),
      hoursPerWeek: parseInt(formData.hoursPerWeek) || 0,
      theoreticalHours: parseInt(formData.theoreticalHours) || 0,
      labHours: parseInt(formData.labHours) || 0,
      subjectType: formData.subjectType || 'regular',
      teacherId: formData.teacherId || null,
      class: formData.class?.trim() || '',
      comments: formData.comments?.trim() || '',
    };

    mutate(payload, {
      onSuccess: (dataAPI: any) => {
        if (dataAPI.result) {
          toast.success("Materia actualizada exitosamente");
          navigate('/admin/ListSubjects');
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || "Error al actualizar materia");
      }
    });
  }, [mutate, navigate, subjectData]);

  const handleCancel = useCallback(() => navigate('/admin/ListSubjects'), [navigate]);

  const handleClear = useCallback(() => {
    reset({
      id: subjectData?.id || '',
      name: subjectData?.name || '',
      code: subjectData?.code || '',
      hoursPerWeek: subjectData?.hoursPerWeek ?? 0,
      theoreticalHours: subjectData?.theoreticalHours ?? 0,
      labHours: subjectData?.labHours ?? 0,
      subjectType: subjectData?.subjectType || 'regular',
      teacherId: subjectData?.teacherId || subjectData?.teacher?.id || '',
      class: subjectData?.class || '',
      comments: subjectData?.comments || '',
    });
    toast.info("Formulario restablecido");
  }, [reset, subjectData]);

  if (!subjectData) return null;

  return (
    <AnimatedPage className="flex justify-center">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <FaBook className="mr-3" />
            Editar Materia
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Actualice los datos de la materia. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
          </p>
        </div>

        <ActionButtons onCancel={handleCancel} onClear={handleClear} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Información de la Materia */}
          <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
              Información de la Materia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <FormField id="name" label="Nombre de la Materia *" required register={register} error={errors.name} defaultValue={subjectData.name} />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <FormField id="code" label="Código *" required register={register} error={errors.code} defaultValue={subjectData.code} />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <FormField id="hoursPerWeek" label="Horas por Semana *" type="number" required register={register} error={errors.hoursPerWeek} defaultValue={subjectData.hoursPerWeek} />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <FormField id="subjectType" label="Plan de Estudio" type="select" register={register} options={SUBJECT_TYPE_OPTIONS} defaultValue={subjectData.subjectType} />
                </div>
              </div>
            </div>
          </div>

          {/* Información Académica */}
          <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
              Información Académica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <FormField id="theoreticalHours" label="Horas Teóricas" type="number" register={register} error={errors.theoreticalHours} defaultValue={subjectData.theoreticalHours} />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <FormField id="labHours" label="Horas Prácticas" type="number" register={register} error={errors.labHours} defaultValue={subjectData.labHours} />
                </div>
              </div>
              <div className="md:col-span-2 flex justify-center">
                <div className="w-full max-w-2xl">
                  <label className="text-gray-700 font-bold mb-1 block">Docente Asignado</label>
                  <select
                    {...register('teacherId')}
                    defaultValue={subjectData.teacherId || subjectData.teacher?.id || ''}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    disabled={isLoadingTeachers}
                  >
                    <option value="">Sin docente asignado</option>
                    {isLoadingTeachers ? (
                      <option value="" disabled>Cargando docentes...</option>
                    ) : (
                      teachers.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} {t.specialization ? `(${t.specialization})` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-center">
                <div className="w-full max-w-2xl">
                  <FormField id="class" label="Ambiente" register={register} error={errors.class} defaultValue={subjectData.class} />
                </div>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
              Información Adicional
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-bold mb-1">Comentarios</label>
                    <textarea
                      {...register('comments')}
                      defaultValue={subjectData.comments}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                      rows={4}
                      placeholder="Observaciones sobre la materia..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="px-10 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {isPending ? 'Actualizando...' : 'Actualizar Materia'}
            </button>
          </div>
        </form>
      </div>
    </AnimatedPage>
  );
}