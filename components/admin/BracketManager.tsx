"use client";

import { CheckCircle2 } from "lucide-react";

import { BracketBoard } from "@/components/features/bracket-board";
import { getRoundLabels } from "@/lib/bracket";
import { flattenBracketMatches } from "@/lib/torneoState";
import type { Equipo, Torneo } from "@/types/tournament";

type BracketManagerProps = {
  torneo: Torneo;
  equipos: Equipo[];
  readOnly?: boolean;
  onSelectWinner?: (payload: { partidoId: string; ganadorEquipoId: string }) => Promise<void> | void;
};

export function BracketManager({ torneo, equipos, readOnly = false, onSelectWinner }: BracketManagerProps) {
  const roundLabels = getRoundLabels(torneo.totalEquipos);
  const matches = flattenBracketMatches(torneo.rondas);

  return (
    <section className="space-y-5 rounded-2xl border-2 border-[#8B735B]/20 bg-white p-5 shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Bracket final</p>
          <h2 className="mt-1 text-2xl font-bold text-[#2D241E]">Gestión de ganadores</h2>
          <p className="mt-2 text-sm text-stone-600">Eliminación directa con cuartos, semis y final.</p>
        </div>
        <span className="rounded-full bg-oro-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-oro-700">
          {torneo.nombre}
        </span>
      </div>

      <BracketBoard torneo={torneo} equipos={equipos} title="Cuadro Eliminatorio" />

      <div className="grid gap-4 lg:grid-cols-2">
        {matches.map((match) => (
          <article key={match.id} className="rounded-2xl border border-[#8B735B]/15 bg-[#F5F5DC] p-4">
            <div className="flex items-center justify-between border-b border-[#8B735B]/10 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{roundLabels[match.rondaIndex] ?? `Ronda ${match.rondaIndex + 1}`}</p>
                <h3 className="text-lg font-bold text-[#2D241E]">Partido {match.partidoIndex + 1}</h3>
              </div>
              {match.ganadorEquipoId ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  <CheckCircle2 size={14} /> Ganador definido
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                { label: match.slotA.sourceLabel, equipoId: match.slotA.equipoId },
                { label: match.slotB.sourceLabel, equipoId: match.slotB.equipoId },
              ].map((slot) => (
                <button
                  key={`${match.id}-${slot.label}`}
                  type="button"
                  disabled={readOnly || !onSelectWinner || !slot.equipoId}
                  onClick={() => slot.equipoId && onSelectWinner?.({ partidoId: match.id, ganadorEquipoId: slot.equipoId })}
                  className={`rounded-2xl border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    match.ganadorEquipoId === slot.equipoId
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-stone-300 bg-white hover:border-[#8B735B]"
                  }`}
                >
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-500">{slot.label}</div>
                  <div className="mt-2 text-sm font-semibold text-[#2D241E]">
                    {slot.equipoId ? "Marcar como ganador" : "Equipo a confirmar"}
                  </div>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}