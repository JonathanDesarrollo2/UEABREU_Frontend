import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import SpinnerGeneral from '../../../layouts/components/spinnerGeneral';
import ListEmpty from '../../../components/ListEmpty';
import Pagination from '../../../components/Pagination';
import { getPaginatedStudentsAPI } from '../../../apis/student';
import ListStudentsAPI from './ListStudentAPI';

interface BusStudentProps {
  Buscar: {
    idBus: string;
    DeBus: string;
    status?: string;
  };
}

export default function LoadListStudentsAPI({ Buscar }: BusStudentProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isError, isLoading } = useQuery({
    queryKey: ['students', { page, limit, Buscar }],
    queryFn: () => getPaginatedStudentsAPI(page, limit, Buscar.DeBus, Buscar.status),
  });

  useEffect(() => {
    setPage(1);
  }, [Buscar]);

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  if (isLoading) return <SpinnerGeneral />;

  if (isError || !data) {
    return (
      <ListEmpty
        message="Error cargando la lista de estudiantes..."
        columns={[
          { name: "Nombre", widthPercent: 20 },
          { name: "Cédula", widthPercent: 15 },
          { name: "Grado", widthPercent: 15 },
          { name: "Sección", widthPercent: 10 },
          { name: "Estado", widthPercent: 15 },
          { name: "Representante", widthPercent: 15 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  if (data.content.length === 0) {
    const mensaje = Buscar.DeBus
      ? `No hay estudiantes que coincidan con "${Buscar.DeBus}"...`
      : `No hay estudiantes registrados...`;

    return (
      <ListEmpty
        message={mensaje}
        columns={[
          { name: "Nombre", widthPercent: 20 },
          { name: "Cédula", widthPercent: 15 },
          { name: "Grado", widthPercent: 15 },
          { name: "Sección", widthPercent: 10 },
          { name: "Estado", widthPercent: 15 },
          { name: "Representante", widthPercent: 15 },
          { name: "Acciones", widthPercent: 10 },
        ]}
      />
    );
  }

  return (
    <>
      <ListStudentsAPI data={data.content} />
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