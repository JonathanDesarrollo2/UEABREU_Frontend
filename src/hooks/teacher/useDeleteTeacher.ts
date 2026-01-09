// src/hooks/teacher/useDeleteTeacher.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteTeacherAPI } from "../../apis/teacher";
import type { TypeTeacherGenericResponse } from "../../types/teacher";

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteTeacherAPI,
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar docente");
    },
    onSuccess: (dataAPI: TypeTeacherGenericResponse) => {
      if (dataAPI.result) {
        toast.success(dataAPI.content[0] || "Docente eliminado exitosamente");
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
      } else {
        toast.error(dataAPI.error[0] || "Error al eliminar docente");
      }
    },
  });
  return {
    mutate: mutation.mutate,
    reset: mutation.reset,
    isPending: mutation.isPending
  };
};