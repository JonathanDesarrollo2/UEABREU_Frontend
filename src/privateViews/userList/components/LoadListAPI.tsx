// src/views/admin/users/components/LoadListAPI.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import SpinnerGeneral from '../../../layouts/components/spinnerGeneral';
import ListEmpty from '../../../components/ListEmpty';
import Pagination from '../../../components/Pagination';
import type { TypeUserBuscar } from '../../../types/user';
import ListAPIs from './ListApis';
import { LoadPaginatedUsers } from '../../../apis/user';

interface BusUserProps {
  Buscar: TypeUserBuscar;
}

export default function LoadListAPI({ Buscar }: BusUserProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isError, isLoading, error } = useQuery({
    queryKey: ['users', { page, limit, Buscar }],
    queryFn: () => LoadPaginatedUsers({ page, limit, Buscar }),
    retry: 1,
  });

  useEffect(() => {
    setPage(1);
  }, [Buscar]);

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  if (isLoading) return <SpinnerGeneral />;

  if (isError) {
    console.error('Error cargando usuarios:', error);
    return (
      <ListEmpty 
        message={`Error cargando la lista de usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`}
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

  // ✅ Garantizar que content sea array
  const usuarios = data?.content || [];
  if (usuarios.length === 0) {
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

  // ✅ Si totalPages es 0, no mostrar paginación
  const totalPages = data?.pagination?.totalPages ?? 1;
  if (totalPages === 0) {
    return <ListAPIs data={usuarios} />;
  }

  return (
    <>
      <ListAPIs data={usuarios} />
      <Pagination
        page={page}
        limit={limit}
        totalPages={totalPages}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />
    </>
  );
}