import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginInsertSchema, type TypeLogin_insert } from "../schema/schema";

export const useInsertUserForm = () => {
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
      // Sin objeto vacío: un {} nunca supera la validación del schema y bloquea
      // silenciosamente el registro de administradores. Solo se completa cuando
      // nivel = 1 (representante) y los campos del representante se registran.
      representativeData: undefined,
      studentsData: [], // Los estudiantes se agregarán dinámicamente con balance por defecto 0
    },
  });
};