"use client";

import { ArrowRight, GitBranch, ShieldCheck } from "lucide-react";

import { canAdvanceTorneoFase, getNextTorneoFase, getPhaseDescription, getPhaseLabel, type TorneoFase } from "@/lib/torneoState";

type PhaseControllerProps = {
  currentPhase: TorneoFase;
  onAdvancePhase: () => Promise<void> | void;
};

export function PhaseController({ currentPhase, onAdvancePhase }: PhaseControllerProps) {
  const nextPhase = getNextTorneoFase(currentPhase);
  const canAdvance = canAdvanceTorneoFase(currentPhase, nextPhase);

  return (
    <section className="rounded-2xl border-2 border-[#8B735B]/20 bg-white p-5 shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Sistema de Fases</p>
          <h2 className="mt-1 text-2xl font-bold text-[#2D241E]">Control de flujo del torneo</h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">{getPhaseDescription(currentPhase)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#2D241E] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            {getPhaseLabel(currentPhase)}
          </span>
          <span className="rounded-full bg-oro-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-oro-700">
            {nextPhase ? `Siguiente: ${getPhaseLabel(nextPhase)}` : "Ultima fase"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <GitBranch size={18} />
          <span>El avance respeta el orden: Inscripcion {"->"} Grupos {"->"} Bracket</span>
        </div>

        <button
          type="button"
          onClick={() => void onAdvancePhase()}
          disabled={!canAdvance}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8B735B] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#7a6550] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
        >
          <ShieldCheck size={18} />
          {nextPhase ? `Avanzar a ${getPhaseLabel(nextPhase)}` : "Fase final alcanzada"}
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}