import { useForm } from "react-hook-form";
import type { typeLogin_in } from "../../../types/login";

export const useInLoginForm = () => {
  return useForm<typeLogin_in>({
    mode: 'onChange',
    defaultValues: {
      usermail: '',
      userpass: ''
    },
  });
};