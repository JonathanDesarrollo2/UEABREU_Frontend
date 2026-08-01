// src/hooks/teacher/useGetTeacherById.ts
import { useQuery } from "@tanstack/react-query";
import { getTeacherByIdAPI } from "../../apis/teacher";

export const useGetTeacherById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['teacher', id],
    queryFn: () => getTeacherByIdAPI(id),
    enabled: enabled && !!id,
  });
};