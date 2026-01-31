import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteSubjectAPI } from "../../apis/subject";

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteSubjectAPI(id),
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar materia");
    },
    onSuccess: (dataAPI) => {
      if (dataAPI.result) {
        toast.success(dataAPI.content[0] || "Materia eliminada exitosamente");
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
      } else {
        toast.error(dataAPI.error[0] || "Error al eliminar materia");
      }
    },
  });
  
  return {
    mutate: mutation.mutate,
    reset: mutation.reset,
    isPending: mutation.isPending
  };
};