import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { buttonClass } from "@/components/ui/button";
import { messageFor, rpc } from "@/lib/server/db";
import { requireSession } from "@/lib/server/session";

export const metadata = { title: "Unirse a una liga", robots: { index: false } };

/** Invite link: /ligas/unirse/ABC123 */
export default async function JoinByLinkPage(props: PageProps<"/ligas/unirse/[code]">) {
  const { code } = await props.params;
  const { token } = await requireSession(`/ligas/unirse/${code}`);

  let id: string | null = null;
  let error: string | null = null;
  try {
    id = await rpc<string>("ls_join_league", { p_token: token, p_code: code });
  } catch (e) {
    error = messageFor(e);
  }
  if (id) redirect(`/ligas/${id}`);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-dvh max-w-[1400px] flex-col items-start justify-center gap-6 px-4 sm:px-6 lg:px-10">
        <h1 className="text-5xl display sm:text-7xl">No se pudo entrar</h1>
        <p className="text-lg text-mute">{error}</p>
        <Link href="/ligas" className={buttonClass("primary", "md")}>
          Ir a mis ligas
        </Link>
      </main>
    </>
  );
}
