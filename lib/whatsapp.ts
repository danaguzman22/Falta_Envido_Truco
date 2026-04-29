import { NOMBRE_TORNEO, ORGANIZATION_WHATSAPP_NUMBER } from "@/config/torneoConfig";
import type { RegistrationInput } from "@/types/tournament";

/**
 * Limpia el string de teléfono para que solo contenga números
 */
function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return "";
  return rawPhone.replace(/[^0-9]/g, "");
}

/**
 * Construye la URL de WhatsApp para enviar la inscripción a la organización
 */
export function buildOrganizationWhatsappUrl(input: RegistrationInput): string {
  // En el servidor (API) usamos ORGANIZATION_WHATSAPP_NUMBER del .env
  const organizationPhone = process.env.ORGANIZATION_WHATSAPP_NUMBER ?? ORGANIZATION_WHATSAPP_NUMBER;
  const normalizedOrganizationPhone = normalizePhone(organizationPhone);
  
  const teamLabel = input.tipoEquipo === "EQUIPO_3" ? "equipo de 3" : "pareja";
  
  const players = [input.jugador1, input.jugador2, input.jugador3]
    .filter((player): player is string => Boolean(player && player.trim()));
    
  const message = [
    `Hola, somos el ${teamLabel} "${input.nombreEquipo}".`,
    `Quedamos inscriptos en ${NOMBRE_TORNEO}.`,
    `Integrantes: ${players.join(", ")}.`,
    `WhatsApp de contacto: ${input.whatsapp}.`,
  ].join(" ");

  return `https://wa.me/${normalizedOrganizationPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Sanitiza el string para almacenamiento
 */
export function sanitizeWhatsappForStorage(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}