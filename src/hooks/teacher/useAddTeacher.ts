// src/hooks/teacher/useAddTeacher.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { addTeacherAPI } from "../../apis/teacher";
import type { TypeTeacherGenericResponse } from "../../types/teacher";

export const useAddTeacher = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: addTeacherAPI,
    onError: (error: Error) => {
      toast.error(error.message || "Error al agregar docente");
    },
    onSuccess: (dataAPI: TypeTeacherGenericResponse) => {
      if (dataAPI.result) {
        toast.success(dataAPI.content.message || "Docente agregado exitosamente");
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
      } else {
        toast.error(dataAPI.error[0] || "Error al agregar docente");
      }
    },
  });
  return {
    mutate: mutation.mutate,
    reset: mutation.reset,
    isPending: mutation.isPending
  };
};