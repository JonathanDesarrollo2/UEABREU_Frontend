import { z } from 'zod';

// Esquema para datos del representante
const representativeDataSchema = z.object({
  fullName: z.string().min(3, "Nombre completo es requerido"),
  identityCard: z.string().min(6, "Cédula es requerida"),
  address: z.string().min(1, "Dirección es requerida"),
  phone: z.string().min(1, "Teléfono es requerido"),
  relationship: z.string().min(1, "Relación es requerida"),
  parentName: z.string().optional(),
  parentIdentityCard: z.string().optional(),
  parentAddress: z.string().optional(),
  parentPhone: z.string().optional(),
  initialBalance: z.number().default(0).optional(),
}).optional();

// Esquema para datos del estudiante
const studentDataSchema = z.object({
  fullName: z.string().min(3, "Nombre completo es requerido"),
  identityCard: z.string().min(6, "Cédula es requerida"),
  birthDate: z.string().min(1, "Fecha de nacimiento es requerida"),
  state: z.string().min(1, "Estado es requerido"),
  zone: z.string().min(1, "Zona es requerida"),
  addressDescription: z.string().min(1, "Descripción de dirección es requerida"),
  phone: z.string().optional(),
  nationality: z.string().min(1, "Nacionalidad es requerida"),
  birthCountry: z.string().min(1, "País de nacimiento es requerido"),
  hasAllergies: z.boolean().default(false),
  allergiesDescription: z.string().optional(),
  hasDiseases: z.boolean().default(false),
  diseasesDescription: z.string().optional(),
  emergencyContact: z.string().min(1, "Contacto de emergencia es requerido"),
  emergencyPhone: z.string().min(1, "Teléfono de emergencia es requerido"),
});

// Esquema extendido para inserción de usuario
export const loginInsertSchemaExtended = z.object({
    usermail: z.string().email("Email inválido"),
    userlogin: z.string().min(4, "El login debe tener al menos 4 caracteres"),
    username: z.string().optional().or(z.literal('')),
    userpass: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    userrepass: z.string().min(6, "La confirmación es requerida"),
    nivel: z.number().min(1).default(1),
    userstatus: z.boolean().default(true),
    representativeData: representativeDataSchema,
    studentsData: z.array(studentDataSchema).optional(),
}).refine((data) => data.userpass === data.userrepass, {
    message: "Las contraseñas no coinciden",
    path: ["userrepass"],
}).refine((data) => {
    // Si el nivel es 1 (representante), representativeData es requerido
    if (data.nivel === 1) {
        return data.representativeData !== undefined;
    }
    return true;
}, {
    message: "Los datos del representante son requeridos para nivel 1",
    path: ["representativeData"],
});

export type typeLogin_insertExtended = z.infer<typeof loginInsertSchemaExtended>;