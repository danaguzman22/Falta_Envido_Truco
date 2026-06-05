import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(8, "WhatsApp invalido")
  .max(20, "WhatsApp invalido")
  .regex(/^[0-9+\-\s()]+$/, "WhatsApp invalido");

export const registrationSchema = z.object({
  nombreEquipo: z.string().trim().min(3, "El nombre del equipo es obligatorio").max(60, "Nombre demasiado largo"),
  jugador1: z.string().trim().min(3, "El Jugador 1 es obligatorio").max(60, "Nombre demasiado largo"),
  jugador2: z.string().trim().min(3, "El Jugador 2 es obligatorio").max(60, "Nombre demasiado largo"),
  jugador3: z.string().trim().min(3, "El Jugador 3 es obligatorio").max(60, "Nombre demasiado largo"),
  whatsapp: phoneSchema,
});


export const adminLoginSchema = z.object({
  email: z.string().trim().email("Email inválido").min(1, "Email requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type RegistrationSchemaInput = z.infer<typeof registrationSchema>;