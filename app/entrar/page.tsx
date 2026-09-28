import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForms } from "@/components/friends/auth-forms";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { dbConfigured } from "@/lib/server/db";
import { getAccount, safeNext } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entra o crea tu cuenta de Last Squad para jugar ligas con tus amigos.",
  robots: { index: false },
};

export default async function SignInPage(props: PageProps<"/entrar">) {
  const next = safeNext((await props.searchParams).next);
  if (await getAccount()) redirect(next);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 pt-28 pb-20 sm:px-6 lg:grid-cols-12 lg:px-10 lg:pt-32">
        <div className="lg:col-span-5">
          <h1 className="text-5xl display sm:text-7xl">
            Juega con
            <br />
            <span className="text-pink">tus amigos.</span>
          </h1>
          <p className="mt-6 max-w-[30rem] text-lg leading-relaxed text-mute">
            Crea una cuenta, monta tu liga y comparte el código. Cada uno elige su equipo en cada ronda y el
            último en pie se lleva el bote.
          </p>
        </div>
        <div className="lg:col-span-7">
          {dbConfigured ? (
            <AuthForms next={next} />
          ) : (
            <p className="bg-ink-2 p-8 text-mute [--cut:24px] chamfer">
              Las ligas con amigos necesitan base de datos. Añade <code>SUPABASE_URL</code> y{" "}
              <code>SUPABASE_PUBLISHABLE_KEY</code> a <code>.env.local</code> y reinicia el servidor.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
