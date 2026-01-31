import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteStudentAPI } from "../../apis/student";

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ studentId, representativeId }: { studentId: string, representativeId: string }) => 
      deleteStudentAPI(studentId, representativeId),
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar estudiante");
    },
    onSuccess: (dataAPI) => {
      if (dataAPI.result) {
        toast.success(dataAPI.content[0] || "Estudiante eliminado exitosamente");
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['statistics'] });
      } else {
        toast.error(dataAPI.error[0] || "Error al eliminar estudiante");
      }
    },
  });
  
  return {
    mutate: mutation.mutate,
    reset: mutation.reset,
    isPending: mutation.isPending
  };
};