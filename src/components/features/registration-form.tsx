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
    setValue,
    formState: { errors },
    reset,
  } = useForm<RegistrationSchemaInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      nombreEquipo: "",
      jugador1: "",
      jugador2: "",
      jugador3: "",
      whatsapp: "",
    },
  });

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

{/* CONTENEDOR DEL TELÉFONO ACTUALIZADO Y ALINEADO */}
        <div className="space-y-2 md:col-span-2 block">
          <label className="text-sm font-semibold text-tierra-900 block">
            Teléfono de contacto *
          </label>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Primer cuadro: Código de área (+54 9) */}
            <div className="flex min-w-[120px] sm:min-w-[140px] items-center justify-between gap-1 rounded-xl border-2 border-tierra-300 bg-tierra-100 px-3 py-3 font-bold text-tierra-600 focus-within:border-oro-500 focus-within:bg-tierra-50 transition-colors">
              <span className="whitespace-nowrap">+54 9</span>
              <input
                required
                type="text"
                placeholder="260"
                maxLength={4}
                className="w-12 bg-transparent text-center outline-none"
                value={areaCode}
                onChange={(e) => handleOnlyNumbers(e.target.value, setAreaCode, 4)}
              />
            </div>
            
            <span className="font-bold text-tierra-400">—</span>
            
            {/* Segundo cuadro: Número local */}
            <input
              required
              type="text"
              placeholder="4123456"
              maxLength={8}
              className="flex-1 rounded-xl border-2 border-tierra-300 bg-tierra-50 px-4 py-3 outline-none focus:border-oro-500 transition-colors"
              value={phoneNumber}
              onChange={(e) => handleOnlyNumbers(e.target.value, setPhoneNumber, 8)}
            />
          </div>
          
          {/* TEXTO ACLARATORIO */}
          <p className="mt-1.5 text-xs font-medium text-tierra-600">
            Aclaración: El código de área (ej: <strong>260</strong>) va en el primer cuadro. El número restante, incluyendo el 4 inicial (ej: <strong>4123456</strong>), va en el segundo.
          </p>
        </div>
      </div>

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