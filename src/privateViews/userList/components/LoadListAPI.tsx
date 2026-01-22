// src/views/admin/users/components/LoadListAPI.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoadPaginatedUsers } from '../../../apis/user';
import SpinnerGeneral from '../../../layouts/components/spinnerGeneral'
import ListEmpty from '../../../components/ListEmpty';
import Pagination from '../../../components/Pagination';
import type { TypeUserBuscar } from '../../../types/user';
import ListAPIs from './ListApis';

interface BusUserProps {
  Buscar: TypeUserBuscar;
}

export default function LoadListAPI({ Buscar }: BusUserProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isError, isLoading } = useQuery({
    queryKey: ['users', { page, limit, Buscar }],
    queryFn: () => LoadPaginatedUsers({ page, limit, Buscar }),
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
        message="Error cargando la lista de usuarios..."
        columns={[
          { name: "Email", widthPercent: 25 },
          { name: "Login", widthPercent: 20 },
          { name: "Nombre", widthPercent: 20 },
          { name: "Nivel", widthPercent: 15 },
          { name: "Estado", widthPercent: 10 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  if (!data || data.content.length === 0) {
    const mensaje = Buscar.DeBus 
      ? `No hay usuarios que coincidan con "${Buscar.DeBus}"...` 
      : `No hay usuarios registrados...`;
    
    return (
      <ListEmpty 
        message={mensaje}
        columns={[
          { name: "Email", widthPercent: 25 },
          { name: "Login", widthPercent: 20 },
          { name: "Nombre", widthPercent: 20 },
          { name: "Nivel", widthPercent: 15 },
          { name: "Estado", widthPercent: 10 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  return (
    <>
      <ListAPIs data={data.content} />
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