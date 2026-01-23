import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Esquema de validación para horario
const scheduleSchema = z.object({
  code: z.string()
    .length(7, { message: 'El código debe tener exactamente 7 dígitos' })
    .regex(/^\d+[A-Z]\d{4}$/, { message: 'Formato inválido (ej: 1V2526)' }),
  grade: z.string().min(1, { message: 'Grado requerido' }),
  section: z.string().length(1, { message: 'Sección requerida' }),
  day: z.enum(['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], {
    errorMap: () => ({ message: 'Día inválido' }),
  }),
  startBlock: z.number()
    .min(1, { message: 'Bloque mínimo es 1' })
    .max(8, { message: 'Bloque máximo es 8 (ocupa 2 bloques)' }),
  subjectId: z.string().min(1, { message: 'Materia requerida' }),
  teacherId: z.string().optional(),
  classroom: z.string().optional(),
  building: z.string().optional(),
}).refine(data => {
  // Validar que el bloque final no sea mayor a 9
  return data.startBlock <= 8; // Si empieza en 8, termina en 9
}, {
  message: 'El horario no puede extenderse más allá del bloque 9',
  path: ['startBlock'],
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;

export function useScheduleForm(defaultValues?: Partial<ScheduleFormData>) {
  const [endBlock, setEndBlock] = useState<number>(defaultValues?.startBlock ? defaultValues.startBlock + 1 : 2);
  
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      code: '',
      grade: '',
      section: 'A',
      day: 'lunes',
      startBlock: 1,
      subjectId: '',
      teacherId: '',
      classroom: '',
      building: '',
      ...defaultValues,
    },
    mode: 'onChange',
  });

  const watchStartBlock = form.watch('startBlock');
  const watchGrade = form.watch('grade');
  const watchSection = form.watch('section');
  const watchDay = form.watch('day');

  useEffect(() => {
    if (watchStartBlock) {
      setEndBlock(watchStartBlock + 1);
    }
  }, [watchStartBlock]);

  return {
    ...form,
    endBlock,
    watchStartBlock,
    watchGrade,
    watchSection,
    watchDay,
  };
}