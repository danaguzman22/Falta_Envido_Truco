"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, LogOut, Settings, Trophy, Users } from "lucide-react";

import type { EquipoTipo, PublicBracketView } from "@/types";

type AdminPanelProps = {
  adminUser: string;
  publicView: PublicBracketView;
};

type TeamDraft = {
  nombre: string;
  tipoEquipo: EquipoTipo;
  jugador1: string;
  jugador2: string;
  jugador3: string;
  whatsapp: string;
};

const TAB_OPTIONS = [
  { id: "inscriptos", label: "Todos", icon: Users },
  { id: "parejas", label: "Parejas", icon: Users },
  { id: "equipo3", label: "Equipo 3", icon: Users },
  { id: "pendientes", label: "Pendientes a Aprobar", icon: Clock },
  { id: "cupo", label: "Editar Cupo", icon: Settings },
] as const;

const CAPACITY_OPTIONS = [8, 16, 32, 64];

function formatDate(isoDate: string | null): string {
  if (!isoDate) {
    return "Sin fecha";
  }

  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#8B735B]/20 bg-[#8B735B]/10 p-6">
      <div className="rounded-lg bg-white p-3 shadow-sm">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase text-stone-500">{title}</p>
        <p className="text-2xl font-black text-[#2D241E]">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        active ? "bg-emerald-400/15 text-emerald-700" : "bg-amber-400/15 text-amber-700"
      }`}
    >
      {label}
    </span>
  );
}

function getTeamType(team: PublicBracketView["equipos"][number]): EquipoTipo {
  return team.tipoEquipo ?? (team.jugadores.length >= 3 ? "EQUIPO_3" : "PAREJA");
}

function getTeamTypeLabel(teamType: EquipoTipo): string {
  return teamType === "EQUIPO_3" ? "Equipo 3" : "Pareja";
}

function renderPlayers(team: PublicBracketView["equipos"][number]): ReactNode {
  return (
    <div className="space-y-1">
      {team.jugadores.map((jugador) => (
        <div key={jugador.id}>{jugador.nombre}</div>
      ))}
    </div>
  );
}

export function AdminPanel({ adminUser, publicView }: AdminPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"inscriptos" | "parejas" | "equipo3" | "pendientes" | "cupo">(
    "inscriptos"
  );
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TeamDraft | null>(null);
  const [savingTeamId, setSavingTeamId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState<string | null>(null);

  const totalTeams = publicView.equipos.length;
  const approvedTeams = publicView.equipos.filter((equipo) => equipo.estado === "APROBADO").length;
  const pendingTeams = publicView.equipos.filter((equipo) => equipo.estado === "PENDIENTE").length;
  const pairTeams = publicView.equipos.filter((equipo) => getTeamType(equipo) === "PAREJA");
  const trioTeams = publicView.equipos.filter((equipo) => getTeamType(equipo) === "EQUIPO_3");
  const tournamentCapacity = publicView.torneo.totalEquipos;
  const canGenerate = approvedTeams >= tournamentCapacity && publicView.torneo.estado !== "TORNEO_EN_CURSO";
  const canDeleteTeams = publicView.torneo.estado === "INSCRIPCION_ABIERTA";

  const tabClass = (id: typeof activeTab) =>
    `flex items-center gap-2 rounded-t-lg px-6 py-3 font-bold transition-all ${
      activeTab === id
        ? "border-b-4 border-oro-500 bg-[#8B735B] text-white"
        : "bg-[#2D241E] text-stone-400 hover:bg-[#3d3129]"
    }`;

  const pendingOnly = publicView.equipos.filter((equipo) => equipo.estado === "PENDIENTE");

  const capacityChoices = CAPACITY_OPTIONS.includes(tournamentCapacity)
    ? CAPACITY_OPTIONS
    : [...CAPACITY_OPTIONS, tournamentCapacity].sort((left, right) => left - right);

  const editingTeam = useMemo(
    () => publicView.equipos.find((equipo) => equipo.id === editingTeamId) ?? null,
    [editingTeamId, publicView.equipos]
  );

  const visibleTeams = useMemo(() => {
    if (activeTab === "parejas") {
      return pairTeams;
    }

    if (activeTab === "equipo3") {
      return trioTeams;
    }

    return publicView.equipos;
  }, [activeTab, pairTeams, publicView.equipos, trioTeams]);

  const listTitle =
    activeTab === "parejas"
      ? "Lista de parejas"
      : activeTab === "equipo3"
        ? "Lista de equipos de 3"
        : "Lista maestra de equipos";

  function startEditingTeam(teamId: string): void {
    const team = publicView.equipos.find((equipo) => equipo.id === teamId);

    if (!team) {
      return;
    }

    setEditingTeamId(team.id);
    setDraft({
      nombre: team.nombre,
      tipoEquipo: getTeamType(team),
      jugador1: team.jugadores[0].nombre,
      jugador2: team.jugadores[1]?.nombre ?? "",
      jugador3: team.jugadores[2]?.nombre ?? "",
      whatsapp: team.whatsapp,
    });
    setEditMessage(null);
  }

  function closeEditor(): void {
    setEditingTeamId(null);
    setDraft(null);
    setEditMessage(null);
  }

  async function handleSaveTeam(): Promise<void> {
    if (!editingTeamId || !draft) {
      return;
    }

    setSavingTeamId(editingTeamId);
    setEditMessage(null);

    try {
      const response = await fetch(`/api/admin/equipos/${editingTeamId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombreEquipo: draft.nombre,
          tipoEquipo: draft.tipoEquipo,
          jugador1: draft.jugador1,
          jugador2: draft.jugador2,
          jugador3: draft.tipoEquipo === "EQUIPO_3" ? draft.jugador3 : "",
          whatsapp: draft.whatsapp,
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "No se pudo actualizar el equipo");
      }

      setEditMessage("Equipo actualizado correctamente");
      closeEditor();
      router.refresh();
    } catch (error) {
      setEditMessage(error instanceof Error ? error.message : "No se pudo actualizar el equipo");
    } finally {
      setSavingTeamId(null);
    }
  }

  async function handleDeleteTeam(teamId: string): Promise<void> {
    const team = publicView.equipos.find((equipo) => equipo.id === teamId);

    if (!team) {
      return;
    }

    const confirmed = window.confirm(`¿Eliminar al equipo "${team.nombre}"? Esta acción no se puede deshacer.`);

    if (!confirmed) {
      return;
    }

    setSavingTeamId(teamId);
    setEditMessage(null);

    try {
      const response = await fetch(`/api/admin/equipos/${teamId}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "No se pudo eliminar el equipo");
      }

      if (editingTeamId === teamId) {
        closeEditor();
      }

      setEditMessage("Equipo eliminado correctamente");
      router.refresh();
    } catch (error) {
      setEditMessage(error instanceof Error ? error.message : "No se pudo eliminar el equipo");
    } finally {
      setSavingTeamId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#2D241E]">
      <header className="flex items-center justify-between border-b-4 border-oro-600 bg-[#2D241E] p-6 text-white shadow-xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-oro-500">Panel Privado</p>
          <h1 className="font-serif text-3xl font-bold">Falta Envido y Truco</h1>
          <p className="mt-1 text-sm text-stone-300">Sesión activa: {adminUser}</p>
        </div>

        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-red-900/50 px-4 py-2 text-sm transition hover:bg-red-800"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </form>
      </header>

      <main className="mx-auto max-w-7xl p-8">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard title="Total Inscritos" value={totalTeams} icon={<Users className="text-blue-500" />} />
          <StatCard title="Aprobados" value={approvedTeams} icon={<CheckCircle className="text-green-500" />} />
          <StatCard title="Pendientes" value={pendingTeams} icon={<Clock className="text-yellow-500" />} />
          <StatCard title="Cupo Requerido" value={tournamentCapacity} icon={<Trophy className="text-oro-500" />} />
        </div>

        <nav className="flex flex-wrap gap-1 border-b-2 border-[#8B735B]">
          {TAB_OPTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)} className={tabClass(id)}>
              <Icon size={20} /> {label}
            </button>
          ))}
        </nav>

        <div className="min-h-[420px] rounded-b-2xl border-x border-b border-[#8B735B]/20 bg-white p-6 shadow-2xl">
          {editMessage ? (
            <div className="mb-4 rounded-2xl border border-oro-300 bg-oro-50 px-4 py-3 text-sm text-[#2D241E]">
              {editMessage}
            </div>
          ) : null}

          {activeTab === "inscriptos" || activeTab === "parejas" || activeTab === "equipo3" ? (
            <div className="animate-fadeIn space-y-5">
              <div className="flex flex-col gap-3 border-b border-[#8B735B]/10 pb-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Gestión de equipos</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#2D241E]">{listTitle}</h2>
                </div>
                <StatusPill label={publicView.torneo.estado} active={publicView.torneo.estado === "TORNEO_EN_CURSO"} />
              </div>

              {!canDeleteTeams ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  La eliminación de equipos solo está habilitada mientras las inscripciones están abiertas.
                </div>
              ) : null}

              {editingTeam && draft ? (
                <div className="rounded-2xl border-2 border-oro-300 bg-[#F5F5DC] p-5 shadow-lg">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Edición de equipo</p>
                      <h3 className="mt-1 text-xl font-bold text-[#2D241E]">{editingTeam.nombre}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={closeEditor}
                      className="text-sm font-semibold text-stone-600 hover:text-[#2D241E]"
                    >
                      Cerrar editor
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-bold text-[#2D241E]">Nombre del equipo</span>
                      <input
                        value={draft.nombre}
                        onChange={(event) => setDraft((current) => (current ? { ...current, nombre: event.target.value } : current))}
                        className="w-full rounded-lg border-2 border-[#8B735B] bg-white p-3"
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-bold text-[#2D241E]">Tipo de equipo</span>
                      <select
                        value={draft.tipoEquipo}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  tipoEquipo: event.target.value === "EQUIPO_3" ? "EQUIPO_3" : "PAREJA",
                                }
                              : current
                          )
                        }
                        className="w-full rounded-lg border-2 border-[#8B735B] bg-white p-3"
                      >
                        <option value="PAREJA">Pareja</option>
                        <option value="EQUIPO_3">Equipo 3</option>
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-[#2D241E]">Jugador 1</span>
                      <input
                        value={draft.jugador1}
                        onChange={(event) => setDraft((current) => (current ? { ...current, jugador1: event.target.value } : current))}
                        className="w-full rounded-lg border-2 border-[#8B735B] bg-white p-3"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-bold text-[#2D241E]">Jugador 2</span>
                      <input
                        value={draft.jugador2}
                        onChange={(event) => setDraft((current) => (current ? { ...current, jugador2: event.target.value } : current))}
                        className="w-full rounded-lg border-2 border-[#8B735B] bg-white p-3"
                      />
                    </label>

                    {draft.tipoEquipo === "EQUIPO_3" ? (
                      <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-bold text-[#2D241E]">Jugador 3</span>
                        <input
                          value={draft.jugador3}
                          onChange={(event) =>
                            setDraft((current) => (current ? { ...current, jugador3: event.target.value } : current))
                          }
                          className="w-full rounded-lg border-2 border-[#8B735B] bg-white p-3"
                        />
                      </label>
                    ) : null}

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-bold text-[#2D241E]">WhatsApp</span>
                      <input
                        value={draft.whatsapp}
                        onChange={(event) => setDraft((current) => (current ? { ...current, whatsapp: event.target.value } : current))}
                        className="w-full rounded-lg border-2 border-[#8B735B] bg-white p-3"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 md:flex-row md:justify-end">
                    <button
                      type="button"
                      onClick={closeEditor}
                      className="rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-[#2D241E]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={savingTeamId === editingTeamId}
                      onClick={handleSaveTeam}
                      className="rounded-2xl bg-[#8B735B] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#7a6550] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                    >
                      {savingTeamId === editingTeamId ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                      type="button"
                      disabled={!canDeleteTeams || savingTeamId === editingTeamId}
                      onClick={() => editingTeamId && void handleDeleteTeam(editingTeamId)}
                      className="rounded-2xl border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400"
                    >
                      Eliminar equipo
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="overflow-x-auto">
                {visibleTeams.length > 0 ? (
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-[0.24em] text-stone-500">
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">Equipo</th>
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">Tipo</th>
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">Jugadores</th>
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">WhatsApp</th>
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">Estado</th>
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTeams.map((team) => {
                        const canApprove = team.estado === "PENDIENTE";

                        return (
                          <tr key={team.id} className="align-top text-[#2D241E]">
                            <td className="border-b border-[#8B735B]/10 px-4 py-4 font-semibold">{team.nombre}</td>
                            <td className="border-b border-[#8B735B]/10 px-4 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                              {getTeamTypeLabel(getTeamType(team))}
                            </td>
                            <td className="border-b border-[#8B735B]/10 px-4 py-4">{renderPlayers(team)}</td>
                            <td className="border-b border-[#8B735B]/10 px-4 py-4">{team.whatsapp}</td>
                            <td className="border-b border-[#8B735B]/10 px-4 py-4">
                              <div className="space-y-2">
                                <StatusPill label={team.estado} active={team.estado === "APROBADO"} />
                                <div className="text-xs text-stone-500">Creado: {formatDate(team.creadoEn)}</div>
                              </div>
                            </td>
                            <td className="border-b border-[#8B735B]/10 px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditingTeam(team.id)}
                                  className="rounded-2xl border border-[#8B735B] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2D241E] transition hover:bg-[#F5F5DC]"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteTeam(team.id)}
                                  disabled={!canDeleteTeams || savingTeamId === team.id}
                                  className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400"
                                >
                                  Eliminar
                                </button>
                                <form action={`/api/admin/equipos/${team.id}/approve`} method="post">
                                  <button
                                    type="submit"
                                    disabled={!canApprove}
                                    className="rounded-2xl bg-[#8B735B] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#7a6550] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                                  >
                                    Aprobar pago
                                  </button>
                                </form>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                    {activeTab === "parejas"
                      ? "No hay parejas registradas todavía."
                      : activeTab === "equipo3"
                        ? "No hay equipos de 3 registrados todavía."
                        : "No hay equipos registrados actualmente."}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-[#8B735B]/10 pt-5 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-stone-600">
                  {canGenerate
                    ? "Ya hay suficientes equipos aprobados para generar el torneo."
                    : `Faltan ${Math.max(0, tournamentCapacity - approvedTeams)} equipos aprobados para activar el bracket.`}
                </div>

                <form action="/api/admin/generar-torneo" method="post">
                  <button
                    type="submit"
                    disabled={!canGenerate}
                    className="rounded-2xl bg-[#8B735B] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#7a6550] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                  >
                    Generar torneo
                  </button>
                </form>
              </div>
            </div>
          ) : null}

          {activeTab === "pendientes" ? (
            <div className="animate-fadeIn space-y-5">
              <div className="flex flex-col gap-3 border-b border-[#8B735B]/10 pb-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Validación</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#2D241E]">Pendientes a Aprobar</h2>
                </div>
                <StatusPill label={`${pendingOnly.length} pendientes`} active={pendingOnly.length === 0} />
              </div>

              {pendingOnly.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-[0.24em] text-stone-500">
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">Equipo</th>
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">Jugadores</th>
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">WhatsApp</th>
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOnly.map((team) => (
                        <tr key={team.id} className="align-top text-[#2D241E]">
                          <td className="border-b border-[#8B735B]/10 px-4 py-4 font-semibold">{team.nombre}</td>
                          <td className="border-b border-[#8B735B]/10 px-4 py-4">
                            {renderPlayers(team)}
                          </td>
                          <td className="border-b border-[#8B735B]/10 px-4 py-4">{team.whatsapp}</td>
                          <td className="border-b border-[#8B735B]/10 px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => startEditingTeam(team.id)}
                                className="rounded-2xl border border-[#8B735B] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2D241E] transition hover:bg-[#F5F5DC]"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteTeam(team.id)}
                                disabled={!canDeleteTeams || savingTeamId === team.id}
                                className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400"
                              >
                                Eliminar
                              </button>
                              <form action={`/api/admin/equipos/${team.id}/approve`} method="post">
                                <button
                                  type="submit"
                                  className="rounded-2xl bg-[#8B735B] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#7a6550]"
                                >
                                  Aprobar pago
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                  No hay equipos pendientes actualmente.
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "cupo" ? (
            <div className="animate-fadeIn max-w-2xl space-y-6">
              <div className="flex flex-col gap-3 border-b border-[#8B735B]/10 pb-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Configuración</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#2D241E]">Editar cupo del torneo</h2>
                </div>
                <StatusPill
                  label={publicView.torneo.estado === "INSCRIPCION_ABIERTA" ? "Editable" : "Estado editable"}
                  active={publicView.torneo.estado === "INSCRIPCION_ABIERTA"}
                />
              </div>

              <div className="rounded-2xl border border-[#8B735B]/20 bg-[#F5F5DC] p-6">
                <p className="text-sm text-stone-700">
                      Cupo actual: <span className="font-bold text-[#2D241E]">{tournamentCapacity} equipos</span>. Podés cambiar el estado del torneo y el cupo desde este formulario.
                </p>

                <form action="/api/admin/cupo" method="post" className="mt-5 space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-[#2D241E]">Cantidad de equipos</span>
                    <select
                      name="totalTeams"
                      defaultValue={tournamentCapacity}
                      className="w-full rounded-lg border-2 border-[#8B735B] bg-[#F5F5DC] p-3"
                    >
                      {capacityChoices.map((option) => (
                        <option key={option} value={option}>
                          {option} equipos
                        </option>
                      ))}
                    </select>
                  </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-bold text-[#2D241E]">Estado del torneo</span>
                        <select
                          name="estado"
                          defaultValue={publicView.torneo.estado}
                          className="w-full rounded-lg border-2 border-[#8B735B] bg-[#F5F5DC] p-3"
                        >
                          <option value="INSCRIPCION_ABIERTA">Inscripción abierta</option>
                          <option value="TORNEO_EN_CURSO">Torneo en curso</option>
                          <option value="FINALIZADO">Finalizado</option>
                        </select>
                      </label>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#8B735B] px-6 py-3 font-bold text-white transition hover:bg-[#7a6550] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                  >
                        Guardar cambios
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <footer className="mt-6 bg-[#2D241E] px-4 py-5 text-center text-sm text-stone-300">
        Panel de Administración UTN · Gestión de inscriptos, cupo y generación del torneo.
      </footer>
    </div>
  );
}