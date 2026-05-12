export interface PublicRegisterPayload {
  usermail: string;
  userlogin: string;
  userpass: string;
  userrepass: string;
  representativeData: {
    fullName: string;
    identityCard: string;
    address: string;
    phone: string;
    relationship: string;
    parentName?: string;
    parentIdentityCard?: string;
    parentPhone?: string;
  };
  studentsData: {
    fullName: string;
    identityCard: string;
    birthDate: string;
    nationality: string;
    birthCountry: string;
    state: string;
    zone: string;
    addressDescription: string;
    phone?: string;
    emergencyContact: string;
    emergencyPhone: string;
    hasAllergies?: boolean;
    allergiesDescription?: string;
    hasDiseases?: boolean;
    diseasesDescription?: string;
    previousSchool?: string;   // nuevo
    municipality?: string;     // nuevo
    currentGrade?: string;
    section?: string;
    status?: string;
    balance?: number;
  }[];
}


export interface PublicApiResponse {
  result: boolean;
  content: any;
  error: string[];
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}