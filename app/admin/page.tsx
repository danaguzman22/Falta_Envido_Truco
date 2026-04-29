import { AdminLoginForm } from "@/components/admin-login-form";
import { NOMBRE_TORNEO } from "@/config/torneoConfig";
import { getAdminEmail, isAdminAuthenticated } from "@/lib/auth";
import { tournamentRepository } from "@/lib/repository";
import { AdminPanel } from "@/src/components/admin/admin-panel";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F5DC] px-4 py-10">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] bg-[#2D241E] p-8 text-white shadow-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-oro-400">Acceso privado</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold">Panel de administración</h1>
            <p className="mt-4 text-sm leading-6 text-stone-300">
              Este espacio protege las acciones sobre equipos, aprobación de pago y generación del torneo. Inicia sesión con tu email autorizado para continuar.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-stone-300">
              <div className="text-xs uppercase tracking-[0.2em] text-oro-400/80">Ruta</div>
              <div className="mt-1 font-semibold text-white">/admin</div>
            </div>
          </section>

          <AdminLoginForm />
        </div>
      </main>
    );
  }

  const publicView = await tournamentRepository.getPublicBracketView();
  const adminUser = await getAdminEmail();

  return (
    <AdminPanel adminUser={adminUser ?? "admin"} publicView={publicView} />
  );
}