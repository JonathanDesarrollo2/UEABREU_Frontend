import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TypeApiResponseGeneric, TypeScheduleCreate } from "../../../types/schedule";
import { addScheduleAPI } from "../../../apis/schedule";

export function useAddSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation<TypeApiResponseGeneric, Error, TypeScheduleCreate>({
    mutationFn: (formdata: TypeScheduleCreate) => addScheduleAPI(formdata),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-preview'] });
    },
  });
}

export function useGetSchedules(params?: any) {
  const queryClient = useQueryClient();
  
  return {
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', params] });
    },
  };
}