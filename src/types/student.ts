export interface TypeStudent {
  id?: string;
  fullName?: string;
  identityCard?: string;
  birthDate?: Date;
  state?: string;
  zone?: string;
  addressDescription?: string;
  phone?: string;
  nationality?: string;
  birthCountry?: string;
  hasAllergies?: boolean;
  allergiesDescription?: string;
  hasDiseases?: boolean;
  diseasesDescription?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  admissionDate?: Date;
  initialSchoolYear?: string;
  currentGrade?: string;
  section?: string;
  status?: 'pendiente' | 'regular' | 'repitiente' | 'condicionado' | 'inactivo';
  representativeId?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  representative?: {
    id?: string;
    fullName?: string;
    identityCard?: string;
    phone?: string;
    relationship?: string;
    address?: string;
  };
}

export interface TypeStudentListResponse {
  result: boolean;
  content: TypeStudent[];
  pagination: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
  };
  error: string[];
}

export interface TypeStudentResponse {
  result: boolean;
  content: TypeStudent;
  error: string[];
}

export interface TypeStudentGenericResponse {
  result: boolean;
  content: string[] | any[];
  error: string[];
}