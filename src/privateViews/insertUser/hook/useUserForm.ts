// hooks/useUserForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginInsertSchema, type TypeLogin_insert } from "../../../types/login";

export const useUserForm = () => {
  return useForm<TypeLogin_insert>({
    resolver: zodResolver(loginInsertSchema),
    mode: 'onChange',
    defaultValues: {
      usermail: '',
      userlogin: '',
      username: '',
      userpass: '',
      userrepass: '',
      nivel: 1,
      userstatus: true,
    },
  });
};