// src/types/teacher.ts
import { z } from 'zod';

// Schema para validación con Zod
export const teacherCreateSchema = z.object({
  fullName: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  identityCard: z.string().min(6, { message: 'La cédula debe tener al menos 6 caracteres' }),
  address: z.string().min(5, { message: 'La dirección es requerida' }),
  phone: z.string().min(7, { message: 'El teléfono es requerido' }),
  email: z.string().email({ message: 'Email inválido' }),
  specialization: z.string().optional(),
  degree: z.string().optional(),
  status: z.boolean().default(true),
  comments: z.string().optional(),
  class: z.string().optional(),
});

export const teacherUpdateSchema = teacherCreateSchema.extend({
  id: z.string().uuid({ message: 'ID inválido' }),
});

// Tipos TypeScript
export type TypeTeacherCreate = z.infer<typeof teacherCreateSchema>;
export type TypeTeacherUpdate = z.infer<typeof teacherUpdateSchema>;

export interface TypeTeacher extends TypeTeacherCreate {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  subjects?: any[];
}

export interface TypeTeacherListResponse {
  result: boolean;
  content: TypeTeacher[];
  pagination: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
  };
  error: string[];
}

export interface TypeTeacherResponse {
  result: boolean;
  content: TypeTeacher;
  error: string[];
}

export interface TypeTeacherGenericResponse {
  result: boolean;
  content: any;
  error: string[];
}

export interface TypeTeacherActive {
  id: string;
  fullName: string;
  specialization?: string;
}

export interface TypeTeacherActiveList {
  result: boolean;
  content: TypeTeacherActive[];
  error: string[];
}
