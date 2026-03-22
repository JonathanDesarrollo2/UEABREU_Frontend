import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Esquema de validación con Zod
const scheduleFormSchema = z.object({
  code: z.string()
    .min(7, 'El código debe tener al menos 7 caracteres')
    .max(7, 'El código debe tener exactamente 7 caracteres'),
  grade: z.string().min(1, 'El grado es requerido'),
  section: z.string().min(1, 'La sección es requerida'),
  day: z.enum(['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], {
    required_error: 'El día es requerido',
  }),
  startBlock: z.string().min(1, 'El bloque inicial es requerido'),
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  classroom: z.string().optional(),
  building: z.string().optional(),
});

// Tipo inferido del esquema
export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export const useScheduleForm = () => {
  return useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      code: '',
      grade: '',
      section: '',
      day: undefined,
      startBlock: '',
      subjectId: '',
      teacherId: '',
      classroom: '',
      building: '',
    },
  });
};