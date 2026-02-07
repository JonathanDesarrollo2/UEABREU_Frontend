// src/pages/teacher/components/LoadListTeacherAPI.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPaginatedTeachersAPI } from '../../../apis/teacher';
import SpinnerGeneral from '../../../layouts/components/spinnerGeneral';
import ListEmpty from '../../../components/ListEmpty';
import Pagination from '../../../components/Pagination';
import ListTeachersAPI from './ListTeacherAPI';

interface BusTeacherProps {
  Buscar: {
    idBus: string;
    DeBus: string;
    statusFilter: 'all' | 'active' | 'inactive';
  };
}

export default function LoadListTeacherAPI({ Buscar }: BusTeacherProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Ajustar los parámetros de búsqueda antes de enviarlos
  const adjustedBuscar = React.useMemo(() => {
    let search = '';
    if (Buscar.DeBus) {
      // Dependiendo del tipo de búsqueda, construimos un string que el backend pueda usar
      // El backend espera un parámetro 'search' que busca en varios campos
      // Pero si queremos filtrar por estado, debemos hacerlo aparte.
      // Sin embargo, el backend actual no soporta filtrar por estado en el mismo endpoint.
      // Por ahora, solo usamos el texto de búsqueda.
      search = Buscar.DeBus;
    }
    return { search, status: Buscar.statusFilter };
  }, [Buscar]);

  const { data, isError, isLoading } = useQuery({
    queryKey: ['teachers', { page, limit, ...adjustedBuscar }],
    queryFn: () => getPaginatedTeachersAPI(page, limit, adjustedBuscar.search),
    // Nota: El backend no soporta filtrar por estado en el endpoint paginado.
    // Podríamos filtrar en el frontend, pero no es lo ideal. 
    // Por ahora, ignoramos el estado en la consulta y filtramos en el frontend.
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

  // Filtramos por estado en el frontend si es necesario (hasta que el backend lo soporte)
  let teachers = data?.content || [];
  if (adjustedBuscar.status !== 'all') {
    const statusBoolean = adjustedBuscar.status === 'active';
    teachers = teachers.filter(teacher => teacher.status === statusBoolean);
  }

  if (teachers.length === 0) {
    let mensaje = '';
    
    if (Buscar.DeBus) {
      mensaje = `No hay profesores que coincidan con "${Buscar.DeBus}"...`;
    } else {
      mensaje = `No hay profesores registrados...`;
    }
    
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

  return (
    <>
      <ListTeachersAPI data={teachers} />
      <Pagination
        page={page}
        limit={limit}
        totalPages={data?.pagination?.totalPages || 1}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />
    </>
  );
}