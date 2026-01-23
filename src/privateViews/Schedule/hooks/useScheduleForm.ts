import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Esquema de validación para horario - CORREGIDO
const scheduleSchema = z.object({
  code: z.string()
    .length(7, { message: 'El código debe tener exactamente 7 dígitos' })
    .regex(/^[0-9A-Z]{7}$/, { message: 'Solo dígitos y letras mayúsculas' }),
  grade: z.string().min(1, { message: 'Grado requerido' }),
  section: z.string().length(1, { message: 'Sección requerida' }),
  day: z.enum(['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], {
    errorMap: () => ({ message: 'Día inválido' }),
  }),
  startBlock: z.string()
    .min(1, { message: 'Bloque inicial requerido' })
    .refine(val => {
      const num = parseInt(val);
      return num >= 1 && num <= 8;
    }, { message: 'Bloque debe estar entre 1 y 8' }),
  subjectId: z.string().min(1, { message: 'Materia requerida' }),
  teacherId: z.string().optional(),
  classroom: z.string().optional(),
  building: z.string().optional(),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;

export function useScheduleForm(defaultValues?: Partial<ScheduleFormData>) {
  const [endBlock, setEndBlock] = useState<number>(
    defaultValues?.startBlock ? parseInt(defaultValues.startBlock) + 1 : 2
  );
  
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      code: '',
      grade: '',
      section: 'A',
      day: 'lunes',
      startBlock: '1',
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
      const blockNum = parseInt(watchStartBlock);
      setEndBlock(blockNum + 1);
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