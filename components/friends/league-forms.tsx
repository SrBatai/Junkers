"use client";

import { useActionState } from "react";
import { type FormState, createLeague, joinLeague } from "@/lib/actions";
import { buttonClass } from "@/components/ui/button";

const initial: FormState = { error: null };
const inputClass =
  "h-12 w-full bg-ink-3 px-4 text-chalk outline-none [--cut:8px] chamfer focus-visible:bg-ink-4";

export function CreateLeagueForm() {
  const [state, action, pending] = useActionState(createLeague, initial);
  return (
    <form action={action} className="flex flex-col gap-4 bg-ink-2 p-6 [--cut:20px] chamfer sm:p-8">
      <h2 className="text-3xl display">Crear liga</h2>
      <div className="flex flex-col gap-2">
        <label htmlFor="league-name" className="text-sm font-semibold text-chalk">
          Nombre de la liga
        </label>
        <input
          id="league-name"
          name="name"
          required
          minLength={2}
          maxLength={32}
          defaultValue="Camino a Estocolmo"
          className={inputClass}
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm font-semibold text-pink">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={buttonClass("primary", "md", "self-start disabled:opacity-60")}
      >
        {pending ? "Creando..." : "Crear liga"}
      </button>
    </form>
  );
}

export function JoinLeagueForm() {
  const [state, action, pending] = useActionState(joinLeague, initial);
  return (
    <form action={action} className="flex flex-col gap-4 bg-ink-2 p-6 [--cut:20px] chamfer sm:p-8">
      <h2 className="text-3xl display">Unirme con código</h2>
      <div className="flex flex-col gap-2">
        <label htmlFor="league-code" className="text-sm font-semibold text-chalk">
          Código de invitación
        </label>
        <input
          id="league-code"
          name="code"
          required
          minLength={6}
          maxLength={6}
          autoComplete="off"
          aria-describedby="league-code-help"
          className={`${inputClass} font-mono tracking-[0.3em] uppercase`}
        />
        <p id="league-code-help" className="text-sm text-mute">
          Te lo pasa quien creó la liga: 6 letras y números.
        </p>
      </div>
      {state.error && (
        <p role="alert" className="text-sm font-semibold text-pink">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={buttonClass("secondary", "md", "self-start disabled:opacity-60")}
      >
        {pending ? "Entrando..." : "Unirme"}
      </button>
    </form>
  );
}
