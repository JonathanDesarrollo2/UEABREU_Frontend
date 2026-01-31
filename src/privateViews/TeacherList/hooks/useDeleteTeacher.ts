import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteTeacherAPI } from "../../../apis/teacher";

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteTeacherAPI(id),
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar profesor");
    },
    onSuccess: (dataAPI) => {
      if (dataAPI.result) {
        toast.success(dataAPI.content[0] || "Profesor eliminado exitosamente");
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        queryClient.invalidateQueries({ queryKey: ['statistics'] });
      } else {
        toast.error(dataAPI.error[0] || "Error al eliminar profesor");
      }
    },
  });
  
  return {
    mutate: mutation.mutate,
    reset: mutation.reset,
    isPending: mutation.isPending
  };
};