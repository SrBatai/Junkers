import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CrownIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import { CreateLeagueForm, JoinLeagueForm } from "@/components/friends/league-forms";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonClass } from "@/components/ui/button";
import { signOut } from "@/lib/actions";
import type { LeagueSummary } from "@/lib/friends";
import { rpc } from "@/lib/server/db";
import { requireSession } from "@/lib/server/session";

export const metadata: Metadata = { title: "Tus ligas", robots: { index: false } };

function statusLabel(l: LeagueSummary) {
  if (l.status === "lobby") return "Esperando jugadores";
  if (l.status === "finished") return l.winner ? "Terminada: ganaste" : "Terminada";
  if (l.out_round !== null) return `Ronda ${l.round}: estás fuera`;
  return `Ronda ${l.round}: sigues vivo`;
}

export default async function LeaguesPage() {
  const { account, token } = await requireSession("/ligas");
  const leagues = await rpc<LeagueSummary[]>("ls_my_leagues", { p_token: token });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-4 pt-28 pb-20 sm:px-6 lg:px-10 lg:pt-32">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs text-pink">Hola, {account.username}</p>
            <h1 className="mt-2 text-5xl display sm:text-7xl">Tus ligas</h1>
          </div>
          <form action={signOut}>
            <button type="submit" className={buttonClass("secondary", "sm")}>
              Cerrar sesión
            </button>
          </form>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <section aria-label="Mis ligas" className="lg:col-span-7">
            {leagues.length === 0 ? (
              <div className="flex h-full flex-col justify-center gap-4 bg-ink-2 p-8 [--cut:20px] chamfer">
                <UsersThreeIcon weight="bold" className="size-10 text-pink" aria-hidden />
                <p className="text-2xl display">Aún no tienes ligas</p>
                <p className="max-w-[32rem] leading-relaxed text-mute">
                  Crea una y comparte el código con tus amigos, o únete con el código que te hayan pasado.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {leagues.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/ligas/${l.id}`}
                      className="group flex items-center gap-4 bg-ink-2 p-5 transition-colors [--cut:14px] chamfer hover:bg-ink-3 sm:p-6"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 truncate text-2xl display">
                          {l.name}
                          {l.is_owner && (
                            <CrownIcon
                              weight="fill"
                              className="size-4 text-pink"
                              aria-label="Eres el creador"
                            />
                          )}
                        </p>
                        <p className="mt-1 text-sm text-mute">
                          {statusLabel(l)} · {l.alive}/{l.members} en pie
                        </p>
                      </div>
                      <ArrowRightIcon
                        weight="bold"
                        className="size-5 text-pink transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <div className="flex flex-col gap-3 lg:col-span-5">
            <CreateLeagueForm />
            <JoinLeagueForm />
          </div>
        </div>

        <p className="mt-8 text-sm text-dim">
          ¿Prefieres jugar solo contra la máquina?{" "}
          <Link href="/jugar" className="text-mute underline underline-offset-4 hover:text-chalk">
            Juega una liga rápida
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
