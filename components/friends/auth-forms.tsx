"use client";

import { useActionState, useState } from "react";
import { type FormState, signIn, signUp } from "@/lib/actions";
import { buttonClass } from "@/components/ui/button";

const inputClass =
  "h-12 w-full bg-ink-3 px-4 text-chalk outline-none [--cut:8px] chamfer focus-visible:bg-ink-4";

function Field({
  id,
  label,
  help,
  ...props
}: React.ComponentProps<"input"> & { id: string; label: string; help?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-chalk">
        {label}
      </label>
      <input id={id} className={inputClass} aria-describedby={help ? `${id}-help` : undefined} {...props} />
      {help && (
        <p id={`${id}-help`} className="text-sm text-mute">
          {help}
        </p>
      )}
    </div>
  );
}

const initial: FormState = { error: null };

export function AuthForms({ next }: { next: string }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [inState, inAction, inPending] = useActionState(signIn, initial);
  const [upState, upAction, upPending] = useActionState(signUp, initial);
  const state = mode === "in" ? inState : upState;
  const pending = mode === "in" ? inPending : upPending;

  return (
    <div className="bg-ink-2 p-6 [--cut:24px] chamfer sm:p-10">
      <div role="tablist" aria-label="Acceso" className="inline-flex bg-ink-3 p-1 [--cut:10px] chamfer">
        {(
          [
            ["in", "Entrar"],
            ["up", "Crear cuenta"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={`px-5 py-2 text-sm font-semibold transition-colors [--cut:7px] chamfer ${
              mode === value ? "bg-chalk text-ink" : "text-mute hover:text-chalk"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form key={mode} action={mode === "in" ? inAction : upAction} className="mt-8 flex flex-col gap-6">
        <input type="hidden" name="next" value={next} />
        <Field
          id="username"
          name="username"
          label="Usuario"
          autoComplete="username"
          required
          minLength={3}
          maxLength={18}
          pattern="[A-Za-z0-9_.\-]{3,18}"
          help={mode === "up" ? "De 3 a 18 caracteres. Así te verán tus amigos." : undefined}
        />
        <Field
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          autoComplete={mode === "in" ? "current-password" : "new-password"}
          required
          minLength={6}
          maxLength={72}
          help={mode === "up" ? "Mínimo 6 caracteres." : undefined}
        />
        {mode === "up" && (
          <Field
            id="confirm"
            name="confirm"
            type="password"
            label="Repite la contraseña"
            autoComplete="new-password"
            required
            minLength={6}
            maxLength={72}
          />
        )}
        {state.error && (
          <p role="alert" className="text-sm font-semibold text-pink">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary", "lg", "self-start disabled:opacity-60")}
        >
          {pending ? "Un momento..." : mode === "in" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
