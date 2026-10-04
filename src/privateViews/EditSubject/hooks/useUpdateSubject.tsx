import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateSubjectAPI } from "../../../apis/schedule";

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => updateSubjectAPI(data),
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar materia");
    },
    onSuccess: (dataAPI: any) => {
      if (dataAPI.result) {
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
      } else {
        toast.error(dataAPI.error?.[0] || "Error al actualizar materia");
      }
    },
  });

  return {
    mutate: mutation.mutate,
    reset: mutation.reset,
    isPending: mutation.isPending,
  };
};