export interface EstudianteForm {
  fullName: string;
  identityCard: string;
  birthDate: string;
  nationality: string;
  birthCountry: string;
  state: string;
  zone: string;
  addressDescription: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  hasAllergies: boolean;
  allergiesDescription: string;
  hasDiseases: boolean;
  diseasesDescription: string;
  previousSchool: string;
  municipality: string;
  aspiredGrade: string;
}

export interface InscripcionFormData {
  email: string;
  password: string;
  confirmPassword: string;
  userlogin: string;
  representativeFullName: string;
  representativeIdentityCard: string;
  representativeAddress: string;
  representativePhone: string;
  relationship: string;
  parentName: string;
  parentIdentityCard: string;
  parentPhone: string;
  students: EstudianteForm[];
}