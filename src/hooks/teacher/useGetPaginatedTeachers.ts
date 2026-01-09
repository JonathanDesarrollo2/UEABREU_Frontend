// src/hooks/teacher/useGetPaginatedTeachers.ts
import { useQuery } from "@tanstack/react-query";
import { getPaginatedTeachersAPI } from "../../apis/teacher";

export const useGetPaginatedTeachers = (page: number = 1, limit: number = 10, search: string = '') => {
  return useQuery({
    queryKey: ['teachers', page, limit, search],
    queryFn: () => getPaginatedTeachersAPI(page, limit, search),
    // keepPreviousData está deprecado en versiones recientes de @tanstack/react-query
    // En su lugar, podemos mantener el comportamiento con placeholderData
    placeholderData: (previousData) => previousData,
  });
};