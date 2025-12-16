import { z } from 'zod';

// Esquema para la información del estudiante
const studentInfoSchema = z.object({
    name: z.string().optional(),
    status: z.boolean().optional()
}).nullable().optional(); // Agregado optional() ya que puede no venir

// Esquema para el usuario activo en sesión
export const userActiveSchema = z.object({
    sesionUser: z.string().optional(),
    sesionEmail: z.string().optional(),
    userStatus: z.boolean().optional(),
    nivel: z.number().optional(),
    studentInfo: studentInfoSchema
});

// Esquema para datos completos del usuario (sin userrepass en la respuesta)
export const loginFullSchema = z.object({
    id: z.string().uuid().optional(),
    usermail: z.string().email(),
    userlogin: z.string(),
    username: z.string().optional().nullable(),
    userpass: z.string().optional(), // Opcional en respuesta, no debería enviarse
    userstatus: z.boolean().optional(),
    nivel: z.number().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

// Esquema para paginación
const paginationSchema = z.object({
    totalRecords: z.number(),
    currentPage: z.number(),
    totalPages: z.number()
});

// Respuesta de la API para listar usuarios paginados
export const apiResponseLoginListSchema = z.object({
    result: z.boolean(),
    content: z.array(loginFullSchema),
    pagination: paginationSchema,
    error: z.array(z.string())
});

// Respuesta de la API para usuario activo
export const apiResponseLoginActiveSchema = z.object({
    result: z.boolean(),
    content: userActiveSchema,
    error: z.array(z.string())
});

// Respuesta genérica (para insertar, actualizar, eliminar)
export const apiResponseGenericSchema = z.object({
    result: z.boolean(),
    content: z.array(z.string()), // mensajes de éxito
    error: z.array(z.string())
});

// Respuesta con token
export const apiResponseTokenSchema = z.object({
    result: z.boolean(),
    content: z.string(), // JWT token
    error: z.array(z.string())
});

// Esquema para búsqueda (debería ser number según tu código)
export const buscarLoginSchema = z.object({
    idBus: z.number(), // Cambiado a number según tu implementación
    DeBus: z.string(),
});

// Para iniciar sesión
export const loginInSchema = z.object({
    usermail: z.string().email(),
    userpass: z.string().min(1, "La contraseña es requerida")
});

// Para insertar usuario - CORREGIDO
export const loginInsertSchema = z.object({
    usermail: z.string().email("Email inválido"),
    userlogin: z.string().min(4, "El login debe tener al menos 4 caracteres"),
    username: z.string().optional().or(z.literal('')),
    userpass: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    userrepass: z.string().min(6, "La confirmación es requerida"),
    nivel: z.number().min(1).default(1),
    userstatus: z.boolean().default(true)
}).refine((data) => data.userpass === data.userrepass, {
    message: "Las contraseñas no coinciden",
    path: ["userrepass"],
});

// Para actualizar usuario
export const loginUpdateSchema = z.object({
    id: z.string().uuid(),
    usermail: z.string().email().optional(),
    userlogin: z.string().min(4).optional(),
    username: z.string().optional().or(z.literal('')),
    userpass: z.string().min(6).optional(),
    userstatus: z.boolean().optional(),
    nivel: z.number().min(1).optional()
});

// Para eliminar usuario
export const loginDeleteSchema = z.object({
    id: z.string().uuid(),
    userlogin: z.string()
});

// Inferir tipos
export type TypeLogin_full = z.infer<typeof loginFullSchema>;
export type TypeUserActive = z.infer<typeof userActiveSchema>;
export type TypePaginationLogin = z.infer<typeof paginationSchema>;
export type TypeLoginBuscar = z.infer<typeof buscarLoginSchema>;
export type TypeApiResponseLoginList = z.infer<typeof apiResponseLoginListSchema>;
export type TypeApiResponseLoginActive = z.infer<typeof apiResponseLoginActiveSchema>;
export type TypeApiResponseGeneric = z.infer<typeof apiResponseGenericSchema>;
export type TypeApiResponseToken = z.infer<typeof apiResponseTokenSchema>;
export type typeLogin_in = z.infer<typeof loginInSchema>;
export type TypeLogin_insert = z.infer<typeof loginInsertSchema>;
export type typeLogin_update = z.infer<typeof loginUpdateSchema>;
export type typeLogin_delete = z.infer<typeof loginDeleteSchema>;

// Alias para compatibilidad con tu código existente
export type TypeApiResponseInsert = TypeApiResponseGeneric;
export type typeLogin_Active = TypeApiResponseLoginActive;