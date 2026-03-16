import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AddUser } from "../../../apis/user";
import type { TypeApiResponseGeneric } from "../../../types/login";

export const useAddUser = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: AddUser,
    onError: (error: Error) => {
      toast.error(error.message || "Error desconocido");
    },
    onSuccess: (dataAPI: TypeApiResponseGeneric) => {
      if (dataAPI.result) {
        toast.success(dataAPI.content[0]);
        queryClient.invalidateQueries({ queryKey: ['users'] });
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