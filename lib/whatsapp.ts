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

  const players = [input.jugador1, input.jugador2, input.jugador3]
    .filter((player): player is string => Boolean(player && player.trim()));

  const message = [
    `¡Hola! Somos el equipo **${input.nombreEquipo}** y queremos inscribirnos en el torneo **${NOMBRE_TORNEO}**.`,
    "",
    "Estos son nuestros integrantes:",
    "",
    `1. ${players[0] ?? ""}`,
    `2. ${players[1] ?? ""}`,
    `3. ${players[2] ?? ""}`,
    "",
    `Teléfono de contacto: **${input.whatsapp}**`,
    "",
    "¿Qué pasos debemos seguir para confirmar nuestra inscripción y el pago? ¡Muchas gracias!",
  ].join("\n");

  return `https://wa.me/${normalizedOrganizationPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Sanitiza el string para almacenamiento
 */
export function sanitizeWhatsappForStorage(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}