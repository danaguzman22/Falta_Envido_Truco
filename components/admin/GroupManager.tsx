"use client";

import { Minus, Plus } from "lucide-react";

import { getMaxGroupsForStage, sortGroupStandings, type GroupBoard, type GroupPhaseStage } from "@/lib/torneoState";

type GroupManagerProps = {
  groups: GroupBoard[];
  stage: GroupPhaseStage;
  readOnly?: boolean;
  onAdjustPoints?: (payload: { groupId: string; equipoId: string; delta: number }) => Promise<void> | void;
};

export function GroupManager({ groups, stage, readOnly = false, onAdjustPoints }: GroupManagerProps) {
  const maxGroups = getMaxGroupsForStage(stage);

  return (
    <section className="rounded-2xl border-2 border-[#8B735B]/20 bg-white p-5 shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Gestión de grupos</p>
          <h2 className="mt-1 text-2xl font-bold text-[#2D241E]">Tabla de posiciones</h2>
          <p className="mt-2 text-sm text-stone-600">Esta fase admite hasta {maxGroups} grupos.</p>
        </div>
        <span className="rounded-full bg-oro-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-oro-700">
          {stage}
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {groups.map((group) => {
          const standings = sortGroupStandings(group.standings);

          return (
            <article key={group.id} className="rounded-2xl border border-[#8B735B]/15 bg-[#F5F5DC] p-4">
              <div className="flex items-center justify-between gap-3 border-b border-[#8B735B]/10 pb-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{group.codigo}</p>
                  <h3 className="text-xl font-bold text-[#2D241E]">{group.nombre}</h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                  {standings.length}/{group.maxEquipos}
                </span>
              </div>

              {standings.length > 0 ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        <th className="pb-2">Equipo</th>
                        <th className="pb-2 text-center">Pts</th>
                        <th className="pb-2 text-center">PJ</th>
                        <th className="pb-2 text-center">DG</th>
                        <th className="pb-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((standing) => (
                        <tr key={standing.equipoId} className="border-t border-[#8B735B]/10">
                          <td className="py-3 pr-3 font-semibold text-[#2D241E]">{standing.nombre}</td>
                          <td className="py-3 text-center font-bold text-[#2D241E]">{standing.puntos}</td>
                          <td className="py-3 text-center text-stone-600">{standing.partidosJugados}</td>
                          <td className="py-3 text-center text-stone-600">{standing.diferencia}</td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                disabled={readOnly || !onAdjustPoints}
                                onClick={() => onAdjustPoints?.({ groupId: group.id, equipoId: standing.equipoId, delta: -1 })}
                                className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Minus size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={readOnly || !onAdjustPoints}
                                onClick={() => onAdjustPoints?.({ groupId: group.id, equipoId: standing.equipoId, delta: 1 })}
                                className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-6 text-sm text-stone-500">
                  No hay equipos asignados en este grupo.
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}