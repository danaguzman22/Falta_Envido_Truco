import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(8, "WhatsApp invalido")
  .max(20, "WhatsApp invalido")
  .regex(/^[0-9+\-\s()]+$/, "WhatsApp invalido");

export const registrationSchema = z.object({
  nombreEquipo: z.string().trim().min(3, "El nombre del equipo es obligatorio").max(60, "Nombre demasiado largo"),
  tipoEquipo: z.enum(["PAREJA", "EQUIPO_3"]),
  jugador1: z.string().trim().min(3, "El Jugador 1 es obligatorio").max(60, "Nombre demasiado largo"),
  jugador2: z.string().trim().min(3, "El Jugador 2 es obligatorio").max(60, "Nombre demasiado largo"),
  jugador3: z.string().trim().max(60, "Nombre demasiado largo").optional(),
  whatsapp: phoneSchema,
}).superRefine((value, context) => {
  if (value.tipoEquipo === "EQUIPO_3" && !value.jugador3?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["jugador3"],
      message: "El Jugador 3 es obligatorio para equipos de 3",
    });
  }
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Usuario requerido"),
  password: z.string().min(1, "Password requerido"),
});

export type RegistrationSchemaInput = z.infer<typeof registrationSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;