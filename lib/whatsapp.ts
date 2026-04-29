import { NOMBRE_TORNEO, ORGANIZATION_WHATSAPP_NUMBER } from "@/config/torneoConfig";
import type { RegistrationInput } from "@/types/tournament";

function normalizePhone(rawPhone: string): string {
  return rawPhone.replace(/[^0-9]/g, "");
}

export function buildOrganizationWhatsappUrl(input: RegistrationInput): string {
  const organizationPhone = process.env.ORGANIZATION_WHATSAPP_NUMBER ?? ORGANIZATION_WHATSAPP_NUMBER;
  const normalizedOrganizationPhone = normalizePhone(organizationPhone);
  const teamLabel = input.tipoEquipo === "EQUIPO_3" ? "equipo de 3" : "pareja";
  const players = [input.jugador1, input.jugador2, input.jugador3].filter(
    (player): player is string => Boolean(player && player.trim())
  );
  const message = [
    `Hola, somos el ${teamLabel} ${input.nombreEquipo}.`,
    `Quedamos inscriptos en ${NOMBRE_TORNEO}.`,
    `Integrantes: ${players.join(", ")}.`,
    `WhatsApp de contacto: ${input.whatsapp}.`,
  ].join(" ");

  return `https://wa.me/${normalizedOrganizationPhone}?text=${encodeURIComponent(message)}`;
}

export function sanitizeWhatsappForStorage(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}