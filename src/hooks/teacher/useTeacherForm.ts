// src/hooks/teacher/useTeacherForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teacherCreateSchema, teacherUpdateSchema, type TypeTeacherCreate, type TypeTeacherUpdate } from "../../types/teacher";

// Hook para creación
export const useTeacherFormCreate = () => {
  return useForm<TypeTeacherCreate>({
    resolver: zodResolver(teacherCreateSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      identityCard: '',
      address: '',
      phone: '',
      email: '',
      specialization: '',
      degree: '',
      status: true,
      comments: '',
      class: '',
    },
  });
};

// Hook para actualización
export const useTeacherFormUpdate = (defaultValues?: Partial<TypeTeacherUpdate>) => {
  return useForm<TypeTeacherUpdate>({
    resolver: zodResolver(teacherUpdateSchema),
    mode: 'onChange',
    defaultValues: {
      id: '',
      fullName: '',
      identityCard: '',
      address: '',
      phone: '',
      email: '',
      specialization: '',
      degree: '',
      status: true,
      comments: '',
      class: '',
      ...defaultValues,
    },
  });
};