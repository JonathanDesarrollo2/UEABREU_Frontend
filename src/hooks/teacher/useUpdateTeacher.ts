// src/hooks/teacher/useUpdateTeacher.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateTeacherAPI } from "../../apis/teacher";
import type { TypeTeacherGenericResponse } from "../../types/teacher";

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateTeacherAPI,
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar docente");
    },
    onSuccess: (dataAPI: TypeTeacherGenericResponse) => {
      if (dataAPI.result) {
        toast.success(dataAPI.content[0] || "Docente actualizado exitosamente");
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        queryClient.invalidateQueries({ queryKey: ['teacher'] });
      } else {
        toast.error(dataAPI.error[0] || "Error al actualizar docente");
      }
    },
  });
  return {
    mutate: mutation.mutate,
    reset: mutation.reset,
    isPending: mutation.isPending
  };
};