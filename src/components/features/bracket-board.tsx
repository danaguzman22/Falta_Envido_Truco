import { getRoundLabels } from "@/lib/bracket";
import type { Equipo, PublicBracketView } from "@/types";
import React from "react";

interface BracketBoardProps extends PublicBracketView {
  title?: string;
}

/**
 * Construye un mapa de equipos por ID para búsqueda rápida
 */
function buildTeamMap(equipos: Equipo[]): Map<string, Equipo> {
  return new Map(equipos.map((equipo) => [equipo.id, equipo]));
}

/**
 * Renderiza una tarjeta de equipo o slot vacío
 */
function renderTeamCard(
  teamMap: Map<string, Equipo>,
  teamId: string | null,
  fallbackLabel: string
): React.ReactNode {
  if (!teamId) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-tierra-300 bg-tierra-50 px-4 py-4 text-sm text-tierra-500">
        {fallbackLabel}
      </div>
    );
  }

  const team = teamMap.get(teamId);

  if (!team) {
    return (
      <div className="rounded-2xl border-2 border-tierra-200 bg-tierra-50 px-4 py-4 text-sm text-tierra-600">
        Equipo no disponible
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-oro-300 bg-gradient-to-br from-oro-50 to-tierra-50 px-4 py-4">
      <div className="text-sm font-bold uppercase tracking-widest text-tierra-800">{team.nombre}</div>
      <div className="mt-2 text-sm text-tierra-700">
        {team.jugadores.map((jugador) => (
          <div key={jugador.id} className="font-medium">
            {jugador.nombre}
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs uppercase tracking-widest text-oro-600 font-semibold">{team.estado}</div>
    </div>
  );
}

/**
 * Componente que visualiza el bracket del torneo
 * Muestra todas las rondas con equipos y partidos
 */
export function BracketBoard({ torneo, equipos, title = "Cuadro del torneo" }: BracketBoardProps) {
  const roundLabels = getRoundLabels(torneo.totalEquipos);
  const teamMap = buildTeamMap(equipos);
  const hasStarted = torneo.estado === "TORNEO_EN_CURSO";

  return (
    <section className="rounded-2xl border-2 border-tierra-200 bg-white p-6">
      <div className="flex flex-col gap-3 border-b-2 border-tierra-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-tierra-600 font-semibold">Bracket</p>
          <h2 className="text-2xl font-serif font-bold text-tierra-900">{title}</h2>
        </div>
        <div className="rounded-full border-2 border-tierra-300 bg-tierra-50 px-4 py-2 text-xs uppercase tracking-widest text-tierra-700 font-semibold">
          {torneo.nombre}
        </div>
      </div>

      {!hasStarted ? (
        <div className="mt-5 rounded-2xl border-2 border-dashed border-oro-300 bg-oro-50 px-5 py-4 text-sm text-oro-700 font-medium">
          ⏳ Esperando confirmación de equipos para generar el bracket...
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="grid min-w-[960px] grid-flow-col gap-5">
          {torneo.rondas.map((round, roundIndex) => (
            <div
              key={`${roundLabels[roundIndex] ?? roundIndex}`}
              className="flex min-w-[220px] flex-col gap-4"
            >
              <div className="rounded-xl border-2 border-tierra-300 bg-tierra-900 px-4 py-3 text-center text-sm font-bold uppercase tracking-widest text-white">
                {roundLabels[roundIndex] ?? `Ronda ${roundIndex + 1}`}
              </div>
              <div className="space-y-4">
                {round.map((match, matchIndex) => (
                  <article
                    key={match.id}
                    className="rounded-2xl border-2 border-tierra-200 bg-tierra-50 p-4 shadow-md"
                  >
                    <div className="mb-3 text-xs uppercase tracking-widest text-tierra-600 font-semibold">
                      Partido {matchIndex + 1}
                    </div>
                    <div className="space-y-3">
                      {renderTeamCard(teamMap, match.slotA.equipoId, match.slotA.sourceLabel)}
                      <div className="text-center text-xs uppercase tracking-widest text-tierra-500 font-bold">
                        vs
                      </div>
                      {renderTeamCard(teamMap, match.slotB.equipoId, match.slotB.sourceLabel)}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
