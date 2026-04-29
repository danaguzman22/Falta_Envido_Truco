"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, type RegistrationSchemaInput } from "@/lib/validation";

interface RegistrationFormProps {
  isOpen: boolean;
}

export function RegistrationForm({ isOpen }: RegistrationFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [areaCode, setAreaCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<RegistrationSchemaInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      nombreEquipo: "",
      tipoEquipo: "" as any, // Empezamos vacío para el "Seleccionar..."
      jugador1: "",
      jugador2: "",
      jugador3: "",
      whatsapp: "",
    },
  });

  const teamType = watch("tipoEquipo");

  // Sincronizar el teléfono partido con el campo oculto de WhatsApp
  useEffect(() => {
    if (areaCode && phoneNumber) {
      setValue("whatsapp", `549${areaCode}${phoneNumber}`);
    } else {
      setValue("whatsapp", "");
    }
  }, [areaCode, phoneNumber, setValue]);

  const handleOnlyLetters = (e: React.FormEvent<HTMLInputElement>, field: keyof RegistrationSchemaInput) => {
    const value = e.currentTarget.value.replace(/[^a-zA-Z\s]/g, "");
    setValue(field, value);
  };

  const handleOnlyNumbers = (value: string, setter: (v: string) => void, limit: number) => {
    const sanitized = value.replace(/[^0-9]/g, "").slice(0, limit);
    setter(sanitized);
  };

  const onSubmit = handleSubmit((values) => {
    if (!values.tipoEquipo) {
      setSubmitError("Por favor, seleccioná un tipo de equipo.");
      return;
    }
    setSubmitError(null);
    setIsPending(true);

    void (async () => {
      try {
        const response = await fetch("/api/inscripciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Error al registrar");
        
        reset();
        setAreaCode("");
        setPhoneNumber("");
        if (payload.whatsappUrl) window.location.href = payload.whatsappUrl;
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Error al registrar");
      } finally {
        setIsPending(false);
      }
    })();
  });

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-3xl border-2 border-tierra-300 bg-white p-8 shadow-lg"
      onSubmit={onSubmit}
    >
      <div className="border-b border-tierra-200 pb-6">
        <p className="text-xs uppercase tracking-widest text-tierra-600 font-semibold">Inscripción</p>
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-tierra-900 mt-1">Sumar un equipo</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Nombre del equipo */}
        <label className="space-y-2 md:col-span-2 block">
          <span className="text-sm font-semibold text-tierra-900">Nombre del equipo *</span>
          <input
            required
            className="w-full rounded-xl border-2 border-tierra-300 bg-tierra-50 px-4 py-3 outline-none focus:border-oro-500"
            placeholder="Los Eternos del Truco"
            disabled={!isOpen || isPending}
            {...register("nombreEquipo")}
          />
        </label>

        {/* SELECTOR DESPLEGABLE */}
        <div className="space-y-2 md:col-span-2 block">
          <span className="text-sm font-semibold text-tierra-900">Seleccionar tipo de equipo *</span>
          <select 
            required
            className="w-full rounded-xl border-2 border-tierra-300 bg-tierra-50 px-4 py-3 text-tierra-900 outline-none focus:border-oro-500"
            disabled={!isOpen || isPending}
            {...register("tipoEquipo")}
          >
            <option value="">Seleccionar...</option>
            <option value="PAREJA">Parejas (2 personas)</option>
            <option value="EQUIPO_3">Equipo de 3 personas</option>
          </select>
        </div>

        {/* Jugador 1 */}
        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-tierra-900">Jugador 1 *</span>
          <input
            required
            className="w-full rounded-xl border-2 border-tierra-300 bg-tierra-50 px-4 py-3 outline-none focus:border-oro-500"
            placeholder="Nombre y apellido"
            {...register("jugador1")}
            onInput={(e) => handleOnlyLetters(e, "jugador1")}
          />
        </label>

        {/* Jugador 2 */}
        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-tierra-900">Jugador 2 *</span>
          <input
            required
            className="w-full rounded-xl border-2 border-tierra-300 bg-tierra-50 px-4 py-3 outline-none focus:border-oro-500"
            placeholder="Nombre y apellido"
            {...register("jugador2")}
            onInput={(e) => handleOnlyLetters(e, "jugador2")}
          />
        </label>

        {/* Jugador 3 (Condicional) */}
        {teamType === "EQUIPO_3" && (
          <label className="space-y-2 block md:col-span-2">
            <span className="text-sm font-semibold text-tierra-900">Jugador 3 *</span>
            <input
              required
              className="w-full rounded-xl border-2 border-tierra-300 bg-tierra-50 px-4 py-3 outline-none focus:border-oro-500"
              placeholder="Nombre y apellido"
              {...register("jugador3")}
              onInput={(e) => handleOnlyLetters(e, "jugador3")}
            />
          </label>
        )}

        {/* TELÉFONO ARGENTINA */}
        <div className="space-y-2 md:col-span-2 block">
          <span className="text-sm font-semibold text-tierra-900">Teléfono de contacto *</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border-2 border-tierra-300 bg-tierra-100 px-3 py-3 font-bold text-tierra-600">
              <span>+54 9</span>
              <input
                required
                type="text"
                placeholder="260"
                className="w-12 bg-transparent text-center outline-none"
                value={areaCode}
                onChange={(e) => handleOnlyNumbers(e.target.value, setAreaCode, 4)}
              />
            </div>
            <span className="font-bold text-tierra-400">—</span>
            <input
              required
              type="text"
              placeholder="4123456"
              className="flex-1 rounded-xl border-2 border-tierra-300 bg-tierra-50 px-4 py-3 outline-none focus:border-oro-500"
              value={phoneNumber}
              onChange={(e) => handleOnlyNumbers(e.target.value, setPhoneNumber, 8)}
            />
          </div>
          <p className="text-xs text-tierra-500 italic mt-1">Ej: 260 — 4123456</p>
        </div>
      </div>

      <p className="text-xs text-tierra-400">* Todos los campos son obligatorios</p>

      {submitError && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-3 text-sm text-red-700">{submitError}</div>
      )}

      <button
        type="submit"
        disabled={!isOpen || isPending}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-tierra-300 text-white font-bold text-lg rounded-xl transition-all shadow-lg active:scale-95"
      >
        {isPending ? "Registrando..." : "¡INSCRIBIR A MI EQUIPO!"}
      </button>
    </motion.form>
  );
}