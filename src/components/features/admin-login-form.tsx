"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validation";

/**
 * Componente de login para administradores
 * Maneja autenticación y sesión de admin
 */
export function AdminLoginForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const { register, handleSubmit } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setSubmitError(null);
    setIsPending(true);

    void (async () => {
      try {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const payload = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(payload.message ?? "No se pudo iniciar sesion");
        }

        router.refresh();
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "No se pudo iniciar sesion");
      } finally {
        setIsPending(false);
      }
    })();
  });

  return (
    <form className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow" onSubmit={onSubmit}>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-sand-200/80">Admin</p>
        <h3 className="text-2xl font-semibold text-white">Ingresar al panel</h3>
        <p className="mt-1 text-sm text-white/70">Usa las credenciales definidas en ADMIN_USER y ADMIN_PASS.</p>
      </div>

      <label className="space-y-2 block">
        <span className="text-sm text-white/80">Usuario</span>
        <input 
          className="w-full rounded-2xl border border-white/10 bg-ink-950/70 px-4 py-3 text-white outline-none transition focus:border-sand-300/80 focus:ring-2 focus:ring-sand-300/20" 
          placeholder="admin" 
          disabled={isPending} 
          {...register("username")} 
        />
      </label>

      <label className="space-y-2 block">
        <span className="text-sm text-white/80">Password</span>
        <input 
          type="password" 
          className="w-full rounded-2xl border border-white/10 bg-ink-950/70 px-4 py-3 text-white outline-none transition focus:border-sand-300/80 focus:ring-2 focus:ring-sand-300/20" 
          placeholder="admin123" 
          disabled={isPending} 
          {...register("password")} 
        />
      </label>

      {submitError ? (
        <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {submitError}
        </p>
      ) : null}

      <button 
        type="submit" 
        disabled={isPending} 
        className="inline-flex w-full items-center justify-center rounded-2xl bg-sand-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink-950 transition hover:bg-sand-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Ingresando..." : "Entrar al panel"}
      </button>
    </form>
  );
}
