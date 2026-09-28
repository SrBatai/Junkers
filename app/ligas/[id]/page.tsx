import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FriendLeague } from "@/components/friends/friend-league";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { FriendLeagueState } from "@/lib/friends";
import { GameError, rpc } from "@/lib/server/db";
import { requireSession } from "@/lib/server/session";

export const metadata: Metadata = { title: "Liga", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function LeaguePage(props: PageProps<"/ligas/[id]">) {
  const { id } = await props.params;
  if (!UUID.test(id)) notFound();
  const { token } = await requireSession(`/ligas/${id}`);

  let state: FriendLeagueState;
  try {
    state = await rpc<FriendLeagueState>("ls_league_state", { p_token: token, p_league: id });
  } catch (error) {
    if (error instanceof GameError && error.message.includes("not_member")) notFound();
    throw error;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-4 pt-24 pb-20 sm:px-6 lg:px-10 lg:pt-28">
        <Link href="/ligas" className="font-mono text-sm text-mute hover:text-chalk">
          ← Tus ligas
        </Link>
        <div className="mt-4">
          <FriendLeague state={state} />
        </div>
        <p className="mt-6 text-sm text-dim">
          Resultados simulados con equipos que han competido en el circuito de THE FINALS. La pantalla se
          actualiza sola cada pocos segundos.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
