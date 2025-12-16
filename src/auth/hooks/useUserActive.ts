// hooks/useUserActive.ts
import { useMutation } from "@tanstack/react-query";
import { userActiveAPI } from "../../apis/login";
import type { TypeApiResponseLoginActive } from "../../types/login";

export const useUserActive = () => {
  return useMutation<TypeApiResponseLoginActive, Error>({
    mutationFn: userActiveAPI,
    retry: 1
  });
};