"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, type RegistrationSchemaInput } from "@/lib/validation";

interface RegistrationFormProps {
  isOpen: boolean;
}

/**
 * Componente de formulario de inscripción de equipos
 * Maneja validación, envío a API y redireccionamiento a WhatsApp
 */
export function RegistrationForm({ isOpen }: RegistrationFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<RegistrationSchemaInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      nombreEquipo: "",
      tipoEquipo: "PAREJA",
      jugador1: "",
      jugador2: "",
      jugador3: "",
      whatsapp: "",
    },
  });

  const teamType = watch("tipoEquipo");

  const onSubmit = handleSubmit((values) => {
    setSubmitError(null);
    setIsPending(true);

    void (async () => {
      try {
        const response = await fetch("/api/inscripciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const payload = (await response.json()) as { message?: string; whatsappUrl?: string };

        if (!response.ok) {
          throw new Error(payload.message ?? "No se pudo registrar el equipo");
        }

        reset();

        if (payload.whatsappUrl) {
          window.location.href = payload.whatsappUrl;
          return;
        }

        setSubmitError("No se encontro el enlace de WhatsApp");
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "No se pudo registrar el equipo");
      } finally {
        setIsPending(false);
      }
    })();
  });

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="space-y-6 rounded-3xl border-2 border-tierra-300 bg-white p-8 shadow-lg"
      onSubmit={onSubmit}
    >
      <div className="flex items-center justify-between gap-4 border-b border-tierra-200 pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-tierra-600 font-semibold">Inscripción</p>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-tierra-900 mt-1">Sumar un equipo</h3>
        </div>
        <motion.span
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest ${
            isOpen
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {isOpen ? "✓ Abierta" : "⊘ Cerrada"}
        </motion.span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2 block">
          <span className="text-sm font-semibold text-tierra-900">Nombre del equipo</span>
          <input
            className="w-full rounded-xl border-2 border-tierra-300 bg-tierra-50 px-4 py-3 text-tierra-900 placeholder-tierra-400 outline-none transition focus:border-oro-500 focus:ring-2 focus:ring-oro-200"
            placeholder="Los Eternos del Truco"
            disabled={!isOpen || isPending}
            {...register("nombreEquipo")}
          />
          {errors.nombreEquipo ? <p className="text-sm text-red-600 font-medium">{errors.nombreEquipo.message}</p> : null}
        </label>

        <div className="space-y-2 md:col-span-2 block">
          <span className="text-sm font-semibold text-tierra-900">Tipo de equipo</span>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { value: "PAREJA", title: "Parejas", description: "2 jugadores" },
              { value: "EQUIPO_3", title: "Equipo 3", description: "3 jugadores" },
            ].map((option) => {
              const isSelected = teamType === option.value;

              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                    isSelected
                      ? "border-oro-500 bg-oro-50 shadow-md"
                      : "border-tierra-300 bg-tierra-50 hover:border-oro-300"
                  }`}
                >
                  <input className="sr-only" type="radio" value={option.value} {...register("tipoEquipo")} />
                  <div className="text-sm font-bold uppercase tracking-widest text-tierra-900">{option.title}</div>
                  <div className="mt-1 text-sm text-tierra-600">{option.description}</div>
                </label>
              );
            })}
          </div>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-tierra-900">Jugador 1</span>
          <input
            className="w-full rounded-xl border-2 border-tierra-300 bg-tierra-50 px-4 py-3 text-tierra-900 placeholder-tierra-400 outline-none transition focus:border-oro-500 focus:ring-2 focus:ring-oro-200"
            placeholder="Nombre y apellido"
            disabled={!isOpen || isPending}
            {...register("jugador1")}
          />
          {errors.jugador1 ? <p className="text-sm text-red-600 font-medium">{errors.jugador1.message}</p> : null}
        </label>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-tierra-900">Jugador 2</span>
          <input
            className="w-full rounded-xl border-2 border-tierra-300 bg-tierra-50 px-4 py-3 text-tierra-900 placeholder-tierra-400 outline-none transition focus:border-oro-500 focus:ring-2 focus:ring-oro-200"
            placeholder="Nombre y apellido"
            disabled={!isOpen || isPending}
            {...register("jugador2")}
          />
          {errors.jugador2 ? <p className="text-sm text-red-600 font-medium">{errors.jugador2.message}</p> : null}
        </label>

        {teamType === "EQUIPO_3" ? (
          <label className="space-y-2 block md:col-span-2">
            <span className="text-sm font-semibold text-tierra-900">Jugador 3</span>
            <input
              className="w-full rounded-xl border-2 border-tierra-300 bg-tierra-50 px-4 py-3 text-tierra-900 placeholder-tierra-400 outline-none transition focus:border-oro-500 focus:ring-2 focus:ring-oro-200"
              placeholder="Nombre y apellido"
              disabled={!isOpen || isPending}
              {...register("jugador3")}
            />
            {errors.jugador3 ? <p className="text-sm text-red-600 font-medium">{errors.jugador3.message}</p> : null}
          </label>
        ) : null}

        <label className="space-y-2 md:col-span-2 block">
          <span className="text-sm font-semibold text-tierra-900">WhatsApp de contacto</span>
          <input
            className="w-full rounded-xl border-2 border-tierra-300 bg-tierra-50 px-4 py-3 text-tierra-900 placeholder-tierra-400 outline-none transition focus:border-oro-500 focus:ring-2 focus:ring-oro-200"
            placeholder="54911..."
            disabled={!isOpen || isPending}
            {...register("whatsapp")}
          />
          {errors.whatsapp ? <p className="text-sm text-red-600 font-medium">{errors.whatsapp.message}</p> : null}
        </label>
      </div>

      {submitError ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium"
        >
          {submitError}
        </motion.div>
      ) : null}

      <motion.button
        type="submit"
        disabled={!isOpen || isPending}
        whileHover={!isPending && isOpen ? { scale: 1.03 } : {}}
        whileTap={!isPending && isOpen ? { scale: 0.97 } : {}}
        className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-tierra-300 disabled:cursor-not-allowed text-white font-bold text-lg uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Registrando...
          </span>
        ) : isOpen ? (
          "¡INSCRIBIR A MI EQUIPO!"
        ) : (
          "Inscripción Cerrada"
        )}
      </motion.button>
    </motion.form>
  );
}
