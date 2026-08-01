// src/types/publicRegistration.ts

// Estudiante dentro de la solicitud pública
export interface PublicStudent {
  fullName: string;
  identityCard: string;
  birthDate: string;          // ISO string o YYYY-MM-DD
  nationality: string;
  birthCountry: string;
  state: string;
  zone: string;
  addressDescription: string;
  phone?: string;
  emergencyContact: string;
  emergencyPhone: string;
  hasAllergies: boolean;
  allergiesDescription?: string;
  hasDiseases: boolean;
  diseasesDescription?: string;
  currentGrade?: string;
  section?: string;
  status?: string;            // siempre 'pendiente'
  balance?: number;           // siempre 0
}

// Datos del representante para el registro público
export interface PublicRepresentative {
  fullName: string;
  identityCard: string;
  address: string;
  phone: string;
  relationship: string;
  parentName?: string;
  parentIdentityCard?: string;
  parentAddress?: string;     // no usado pero en interface
  parentPhone?: string;
}

// Payload completo para el endpoint /api/public/register
export interface PublicRegisterPayload {
  usermail: string;
  userlogin: string;          // se enviará aunque sea generado
  userpass: string;
  userrepass: string;
  representativeData: PublicRepresentative;
  studentsData: PublicStudent[];
  pdfBase64?: string;   // ← NUEVO
  planillaNumber?: number;           // siempre 0
}

// Respuesta genérica de la API
export interface PublicApiResponse {
  result: boolean;
  content: string[];
  error: string[];
}

// Payload para verificar el código
export interface VerifyEmailPayload {
  email: string;
  code: string;               // 5 dígitos
}