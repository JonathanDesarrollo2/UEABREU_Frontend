// src/pages/teacher/hooks/useUpdateTeacher.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateTeacherAPI } from "../../../apis/teacher";

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => updateTeacherAPI(data),
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar profesor");
    },
    onSuccess: (dataAPI) => {
      if (dataAPI.result) {
        toast.success(dataAPI.content[0] || "Profesor actualizado exitosamente");
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        queryClient.invalidateQueries({ queryKey: ['statistics'] });
      } else {
        toast.error(dataAPI.error[0] || "Error al actualizar profesor");
      }
    },
  });
  
  return {
    mutate: mutation.mutate,
    reset: mutation.reset,
    isPending: mutation.isPending
  };
};