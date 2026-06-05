"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, LogOut, Settings, Users, Calendar, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { PublicBracketView } from "@/types";

type AdminPanelProps = {
  adminUser: string;
  publicView: PublicBracketView;
};

type TeamDraft = {
  nombre: string;
  jugador1: string;
  jugador2: string;
  jugador3: string;
  whatsapp: string;
};

// Pestañas simplificadas: Unificamos las listas eliminando filtros obsoletos de categorías
const TAB_OPTIONS = [
  { id: "inscriptos", label: "Todos los Equipos", icon: Users },
  { id: "pendientes", label: "Pendientes a Aprobar", icon: Clock },
  { id: "cupo", label: "Estado del Torneo", icon: Settings },
] as const;

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

  return `${day}/${month}/${year} a las ${hours}:${minutes} hs`;
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#8B735B]/20 bg-[#8B735B]/10 p-6">
      <div className="rounded-lg bg-white p-3 shadow-sm">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{title}</p>
        <p className="text-2xl font-black text-[#2D241E]">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  const getLabelText = (status: string) => {
    if (status === "INSCRIPCION_ABIERTA") return "Inscripciones Abiertas";
    if (status === "INSCRIPCION_CERRADA") return "Inscripciones Pausadas";
    if (status === "TORNEO_EN_CURSO") return "Torneo en Curso";
    if (status === "FINALIZADO") return "Torneo Finalizado";
    return status;
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${
        active ? "bg-emerald-400/15 text-emerald-700" : "bg-amber-400/15 text-amber-700"
      }`}
    >
      {getLabelText(label)}
    </span>
  );
}

function renderPlayers(team: PublicBracketView["equipos"][number]): ReactNode {
  return (
    <div className="space-y-1">
      {team.jugadores.map((jugador) => (
        <div key={jugador.id} className="text-sm text-stone-700 font-medium">· {jugador.nombre}</div>
      ))}
    </div>
  );
}

export function AdminPanel({ adminUser, publicView }: AdminPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"inscriptos" | "pendientes" | "cupo">("inscriptos");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TeamDraft | null>(null);
  const [savingTeamId, setSavingTeamId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState<string | null>(null);

  // 1. Totales generales unificados (Sin límites fijos de /32)
  const totalTeams = publicView.equipos.length;
  const approvedTeams = publicView.equipos.filter((e) => e.estado === "APROBADO").length;
  const pendingTeams = publicView.equipos.filter((e) => e.estado === "PENDIENTE").length;

  // Las inscripciones solo están abiertas si el estado acompaña
  const canDeleteTeams = publicView.torneo.estado === "INSCRIPCION_ABIERTA";

  const tabClass = (id: typeof activeTab) =>
    `flex items-center gap-2 rounded-t-lg px-6 py-3 font-bold transition-all ${
      activeTab === id
        ? "border-b-4 border-oro-500 bg-[#8B735B] text-white"
        : "bg-[#2D241E] text-stone-400 hover:bg-[#3d3129]"
    }`;

  const pendingOnly = publicView.equipos.filter((equipo) => equipo.estado === "PENDIENTE");

  const editingTeam = useMemo(
    () => publicView.equipos.find((equipo) => equipo.id === editingTeamId) ?? null,
    [editingTeamId, publicView.equipos]
  );

  // Filtro unificado para la tabla de control
  const visibleTeams = useMemo(() => {
    if (activeTab === "pendientes") {
      return pendingOnly;
    }
    return publicView.equipos;
  }, [activeTab, publicView.equipos, pendingOnly]);

  const listTitle =
    activeTab === "pendientes"
      ? "Equipos Pendientes de Aprobación"
      : "Lista Maestra de Equipos Registrados";

  function startEditingTeam(teamId: string): void {
    const team = publicView.equipos.find((equipo) => equipo.id === teamId);
    if (!team) return;

    setEditingTeamId(team.id);
    setDraft({
      nombre: team.nombre,
      jugador1: team.jugadores[0]?.nombre ?? "",
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
    if (!editingTeamId || !draft) return;

    setSavingTeamId(editingTeamId);
    setEditMessage(null);

    try {
      const response = await fetch(`/api/admin/equipos/${editingTeamId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreEquipo: draft.nombre,
          jugador1: draft.jugador1,
          jugador2: draft.jugador2,
          jugador3: draft.jugador3,
          whatsapp: draft.whatsapp,
        }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "No se pudo actualizar el equipo");

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
    if (!team) return;

    const confirmed = window.confirm(`¿Eliminar al equipo "${team.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    setSavingTeamId(teamId);
    setEditMessage(null);

    try {
      const response = await fetch(`/api/admin/equipos/${teamId}`, { method: "DELETE" });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "No se pudo eliminar el equipo");

      if (editingTeamId === teamId) closeEditor();
      setEditMessage("Equipo eliminado correctamente");
      router.refresh();
    } catch (error) {
      setEditMessage(error instanceof Error ? error.message : "No se pudo eliminar el equipo");
    } finally {
      setSavingTeamId(null);
    }
  }
  function exportarPDF() {
    const doc = new jsPDF();
    const aprobados = publicView.equipos.filter((e) => e.estado === "APROBADO");

    // Título del PDF
    doc.setFontSize(18);
    doc.text("Equipos Aprobados - Torneo de Truco", 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Total aprobados: ${aprobados.length}`, 14, 28);

    // Preparamos los datos de las filas
    const tableData = aprobados.map((team) => [
      team.nombre,
      team.jugadores[0]?.nombre || "-",
      team.jugadores[1]?.nombre || "-",
      team.jugadores[2]?.nombre || "-",
      team.whatsapp,
    ]);

    // Dibujamos la tabla
    autoTable(doc, {
      startY: 35,
      head: [["Equipo", "Jugador 1", "Jugador 2", "Jugador 3", "WhatsApp"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [139, 115, 91] }, // Es el color marrón de tu web (#8B735B)
      styles: { fontSize: 10 },
    });

    // Forzamos la descarga
    doc.save("Equipos_Aprobados.pdf");
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
        {/* REGLAMENTO E INFO DE UTN INTEGRADA EN ALERTA INFORMATIVA */}
        <div className="mb-6 rounded-2xl border border-oro-400/40 bg-[#8B735B]/5 p-5 text-sm text-stone-800 shadow-sm">
          <h4 className="font-bold text-[#2D241E] flex items-center gap-2 text-base">
            <Calendar size={18} className="text-oro-600" /> Control del Reglamento y Flujo Operativo UTN
          </h4>
          <p className="mt-2 text-stone-600 leading-relaxed">
            Desde este panel administrás las inscripciones del torneo interuniversitario. Recordá que, según las bases acordadas, una vez que el estado operativo pase a <strong>Torneo en Curso</strong> o <strong>Finalizado</strong>, la carga pública quedará bloqueada por completo para garantizar la transparencia del sorteo externo.
          </p>
        </div>

        {/* CONTADORES UNIFICADOS SIN EL LÍMITE SOBERBIO DE PAREJAS/EQUIPOS INDIVIDUALES */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Total de Inscriptos" value={totalTeams} icon={<Users className="text-blue-500" />} />
          <StatCard title="Equipos Aprobados" value={approvedTeams} icon={<CheckCircle className="text-green-500" />} />
          <StatCard title="Equipos en Espera" value={pendingTeams} icon={<Clock className="text-yellow-500" />} />
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

          {/* VISTA MAESTRA O DE PENDIENTES */}
          {activeTab === "inscriptos" || activeTab === "pendientes" ? (
            <div className="animate-fadeIn space-y-5">
              
              {/* HEADER DE LA TABLA + BOTÓN DE DESCARGA */}
              <div className="flex flex-col gap-4 border-b border-[#8B735B]/10 pb-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Gestión de inscriptos</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#2D241E]">{listTitle}</h2>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={exportarPDF}
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
              >
                <Download size={16} /> Descargar Aprobados (PDF)
              </button>
                  <StatusPill label={publicView.torneo.estado} active={publicView.torneo.estado === "INSCRIPCION_ABIERTA"} />
                </div>
              </div>

              {!canDeleteTeams ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  La modificación y eliminación de registros se bloquea automáticamente cuando la inscripción no está abierta.
                </div>
              ) : null}

              {/* EDITOR INTEGRADO */}
              {editingTeam && draft ? (
                <div className="rounded-2xl border-2 border-oro-300 bg-[#F5F5DC] p-5 shadow-lg">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Edición de equipo</p>
                      <h3 className="mt-1 text-xl font-bold text-[#2D241E]">{editingTeam.nombre}</h3>
                    </div>
                    <button type="button" onClick={closeEditor} className="text-sm font-semibold text-stone-600 hover:text-[#2D241E]">
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

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-bold text-[#2D241E]">Jugador 3 (Suplente/Tercero Opcional)</span>
                      <input
                        value={draft.jugador3}
                        onChange={(event) =>
                          setDraft((current) => (current ? { ...current, jugador3: event.target.value } : current))
                        }
                        className="w-full rounded-lg border-2 border-[#8B735B] bg-white p-3"
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-bold text-[#2D241E]">WhatsApp de contacto</span>
                      <input
                        value={draft.whatsapp}
                        onChange={(event) => setDraft((current) => (current ? { ...current, whatsapp: event.target.value } : current))}
                        className="w-full rounded-lg border-2 border-[#8B735B] bg-white p-3"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 md:flex-row md:justify-end">
                    <button type="button" onClick={closeEditor} className="rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-[#2D241E]">
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

              {/* TABLA PRINCIPAL */}
              <div className="overflow-x-auto">
                {visibleTeams.length > 0 ? (
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-[0.24em] text-stone-500">
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">Equipo</th>
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">Jugadores</th>
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">WhatsApp</th>
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">Estado de Pago</th>
                        <th className="border-b border-[#8B735B]/10 px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTeams.map((team) => {
                        const canApprove = team.estado === "PENDIENTE";

                        return (
                          <tr key={team.id} className="align-top text-[#2D241E]">
                            <td className="border-b border-[#8B735B]/10 px-4 py-4 font-semibold">
                              {team.nombre}
                              <div className="text-[10px] font-mono mt-0.5 text-stone-400 uppercase tracking-wider">
                                {team.jugadores.length >= 3 ? "Trío" : "Pareja"}
                              </div>
                            </td>
                            <td className="border-b border-[#8B735B]/10 px-4 py-4">{renderPlayers(team)}</td>
                            <td className="border-b border-[#8B735B]/10 px-4 py-4 font-medium">{team.whatsapp}</td>
                            <td className="border-b border-[#8B735B]/10 px-4 py-4">
                              <div className="space-y-1.5">
                                <StatusPill label={team.estado} active={team.estado === "APROBADO"} />
                                <div className="text-[11px] text-stone-500 font-medium">
                                  Inscrito: {formatDate(team.creadoEn)}
                                </div>
                              </div>
                            </td>
                            <td className="border-b border-[#8B735B]/10 px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditingTeam(team.id)}
                                  className="rounded-2xl border border-[#8B735B] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#2D241E] transition hover:bg-[#F5F5DC]"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteTeam(team.id)}
                                  disabled={!canDeleteTeams || savingTeamId === team.id}
                                  className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400"
                                >
                                  Eliminar
                                </button>
                                <form action={`/api/admin/equipos/${team.id}/approve`} method="post">
                                  <button
                                    type="submit"
                                    disabled={!canApprove}
                                    className="rounded-2xl bg-[#8B735B] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#7a6550] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
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
                    {activeTab === "pendientes"
                      ? "No hay ningún equipo pendiente de aprobación en este momento."
                      : "No hay ningún equipo registrado en el sistema todavía."}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* CONFIGURACIÓN SÓLO DEL ESTADO OPERATIVO */}
          {activeTab === "cupo" ? (
            <div className="animate-fadeIn max-w-2xl space-y-6">
              <div className="flex flex-col gap-3 border-b border-[#8B735B]/10 pb-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Configuración Operativa</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#2D241E]">Gestionar Estado de Inscripción</h2>
                </div>
              </div>

              <div className="rounded-2xl border border-[#8B735B]/20 bg-[#F5F5DC] p-6">
                <p className="text-sm text-stone-700 leading-relaxed">
                  Modificá las compuertas de la landing page. Al seleccionar <strong>Torneo en curso</strong> o <strong>Torneo finalizado</strong>, el backend bloqueará de forma inmediata el ingreso de nuevos formularios públicos.
                </p>

                <form action="/api/admin/cupo" method="post" className="mt-5 space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-bold text-[#2D241E]">Estado actual de la plataforma</span>
                    <select
                      name="estado"
                      defaultValue={publicView.torneo.estado}
                      className="w-full rounded-lg border-2 border-[#8B735B] bg-white p-3 font-medium text-[#2D241E]"
                    >
                      <option value="INSCRIPCION_ABIERTA">Inscripciones Abiertas (Formulario público activo)</option>
                      <option value="INSCRIPCION_CERRADA">Inscripciones Cerradas (Formulario pausado)</option>
                      <option value="TORNEO_EN_CURSO">Torneo en Curso (Inscripciones clausuradas por sorteo)</option>
                      <option value="FINALIZADO">Torneo Finalizado (Plataforma en archivo histórico)</option>
                    </select>
                  </label>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#8B735B] px-6 py-3 font-bold text-white transition hover:bg-[#7a6550]"
                  >
                    Guardar Cambios de Estado
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <footer className="mt-6 bg-[#2D241E] px-4 py-5 text-center text-sm text-stone-300">
        Panel de Administración UTN · Control unificado de inscriptos y estados operativos de la landing.
      </footer>
    </div>
  );
}