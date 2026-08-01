import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthUser } from "../../../apis/login";
import type { TypeApiResponseToken } from "../../../types/login";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const userInLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: AuthUser,
    onSuccess: (dataAPI: TypeApiResponseToken) => {
      if (dataAPI.result && dataAPI.content) {
        localStorage.setItem('tokcattleraising_inCattleRanchCloud', dataAPI.content);
        toast.success('¡Bienvenido!', { autoClose: 1000 });
        queryClient.invalidateQueries({ queryKey: ['userActive'] });
        setTimeout(() => {
          navigate('/app');
        }, 1200);
      } else {
        const errorMsg = dataAPI.error?.[0] || "Error en el login";
        toast.error(errorMsg);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error desconocido");
    },
  });

  return {
    mutate: mutation.mutate,
    reset: mutation.reset,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
};