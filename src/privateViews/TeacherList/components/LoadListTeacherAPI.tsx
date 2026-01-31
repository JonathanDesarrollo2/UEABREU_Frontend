import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import SpinnerGeneral from '../../../layouts/components/spinnerGeneral';
import ListEmpty from '../../../components/ListEmpty';
import Pagination from '../../../components/Pagination';
import { getPaginatedTeachersAPI } from '../../../apis/teacher';
import ListTeachersAPI from './ListTeacherAPI';

interface BusTeacherProps {
  Buscar: {
    idBus: string;
    DeBus: string;
    status?: string;
  };
}

export default function LoadListTeachersAPI({ Buscar }: BusTeacherProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isError, isLoading } = useQuery({
    queryKey: ['teachers', { page, limit, Buscar }],
    queryFn: () => getPaginatedTeachersAPI(page, limit, Buscar.DeBus),
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
        message="Error cargando la lista de profesores..."
        columns={[
          { name: "Nombre", widthPercent: 20 },
          { name: "Cédula", widthPercent: 15 },
          { name: "Email", widthPercent: 20 },
          { name: "Teléfono", widthPercent: 15 },
          { name: "Especialización", widthPercent: 15 },
          { name: "Estado", widthPercent: 10 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  if (!data || data.content.length === 0) {
    const mensaje = Buscar.DeBus 
      ? `No hay profesores que coincidan con "${Buscar.DeBus}"...` 
      : `No hay profesores registrados...`;
    
    return (
      <ListEmpty 
        message={mensaje}
        columns={[
          { name: "Nombre", widthPercent: 20 },
          { name: "Cédula", widthPercent: 15 },
          { name: "Email", widthPercent: 20 },
          { name: "Teléfono", widthPercent: 15 },
          { name: "Especialización", widthPercent: 15 },
          { name: "Estado", widthPercent: 10 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  // Manejar el caso cuando pagination podría ser undefined
  const pagination = data.pagination || {
    totalRecords: data.content.length,
    currentPage: page,
    totalPages: 1
  };

  return (
    <>
      <ListTeachersAPI data={data.content} />
      <Pagination
        page={page}
        limit={limit}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />
    </>
  );
}