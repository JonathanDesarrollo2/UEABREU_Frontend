// src/hooks/teacher/useGetActiveTeachers.ts
import { useQuery } from "@tanstack/react-query";
import { getActiveTeachersAPI } from "../../apis/teacher";

export const useGetActiveTeachers = () => {
  return useQuery({
    queryKey: ['activeTeachers'],
    queryFn: getActiveTeachersAPI,
  });
};