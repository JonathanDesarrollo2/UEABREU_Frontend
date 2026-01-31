// src/types/user.ts
export interface TypeUser_full {
  id?: string;
  usermail?: string;
  userlogin?: string;
  username?: string;
  userstatus?: boolean;
  nivel?: number;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Información extendida para representantes
  representative?: {
    id?: string;
    fullName?: string;
    identityCard?: string;
    address?: string;
    phone?: string;
    relationship?: string;
    balance?: number;
    balanceFormatted?: string;
    balanceStatus?: 'debt' | 'zero' | 'credit';
    students?: Array<{
      id?: string;
      fullName?: string;
      identityCard?: string;
      birthDate?: Date | string;
      status?: 'pendiente' | 'regular' | 'repitiente' | 'condicionado' | 'inactivo';
      emergencyContact?: string;
      emergencyPhone?: string;
      currentGrade?: string;
      section?: string;
      // Agregar más campos si son necesarios
    }>;
  };
}

// Añade esto a tus tipos existentes
export interface TypeUserBuscar {
  idBus: string;
  DeBus: string;
  nivelFilter?: 'all' | '1' | '2' | 'admin-emails';
}

export interface TypeUser_delete {
  id: string;
  userlogin: string;
}

export interface TypeApiResponsePaginatedUsers {
  result: boolean;
  content: TypeUser_full[];
  pagination: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
  };
  error: string[];
}
