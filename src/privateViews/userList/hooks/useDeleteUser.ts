import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { RemoveUser } from "../../../apis/user";
import type { TypeUser_delete } from "../../../types/user";
import type { TypeApiResponseGeneric } from "../../../types/login";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (formdata: TypeUser_delete) => RemoveUser(formdata),
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar usuario");
    },
    onSuccess: (dataAPI: TypeApiResponseGeneric) => {
      if (dataAPI.result) {
        toast.success(dataAPI.content[0]);
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['statistics'] });
      } else {
        toast.error(dataAPI.error[0]);
      }
    },
  });
  
  return {
    mutate: mutation.mutate,
    reset: mutation.reset,
    isPending: mutation.isPending
  };
};