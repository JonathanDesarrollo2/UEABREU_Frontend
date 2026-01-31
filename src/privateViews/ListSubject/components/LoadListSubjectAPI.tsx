import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import SpinnerGeneral from '../../../layouts/components/spinnerGeneral';
import ListEmpty from '../../../components/ListEmpty';
import Pagination from '../../../components/Pagination';
import { getPaginatedSubjectsAPI } from '../../../apis/subject';
import ListSubjectsAPI from './ListSubjectAPI';

interface BusSubjectProps {
  Buscar: {
    idBus: string;
    DeBus: string;
    subjectType?: string;
    grade?: string;
  };
}

export default function LoadListSubjectsAPI({ Buscar }: BusSubjectProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isError, isLoading } = useQuery({
    queryKey: ['subjects', { page, limit, Buscar }],
    queryFn: () => getPaginatedSubjectsAPI(
      page, 
      limit, 
      Buscar.DeBus, 
      Buscar.grade, 
      Buscar.subjectType
    ),
  });

  useEffect(() => {
    setPage(1);
  }, [Buscar]);

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  if (isLoading) {
    return <SpinnerGeneral />;
  }

  if (isError) {
    return (
      <ListEmpty 
        message="Error cargando la lista de materias..."
        columns={[
          { name: "Código", widthPercent: 15 },
          { name: "Nombre", widthPercent: 25 },
          { name: "Tipo", widthPercent: 15 },
          { name: "Horas/Semana", widthPercent: 15 },
          { name: "Docente", widthPercent: 20 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  if (!data || data.content.length === 0) {
    const mensaje = Buscar.DeBus 
      ? `No hay materias que coincidan con "${Buscar.DeBus}"...` 
      : `No hay materias registradas...`;
    
    return (
      <ListEmpty 
        message={mensaje}
        columns={[
          { name: "Código", widthPercent: 15 },
          { name: "Nombre", widthPercent: 25 },
          { name: "Tipo", widthPercent: 15 },
          { name: "Horas/Semana", widthPercent: 15 },
          { name: "Docente", widthPercent: 20 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  return (
    <>
      <ListSubjectsAPI data={data.content} />
      <Pagination
        page={page}
        limit={limit}
        totalPages={data.pagination.totalPages}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />
    </>
  );
}