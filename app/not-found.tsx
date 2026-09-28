import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[1400px] flex-col items-start justify-center px-4 sm:px-6 lg:px-10">
      <p className="font-mono text-sm text-pink">Error 404</p>
      <h1 className="mt-4 text-7xl display sm:text-9xl">
        Eliminado.
        <br />
        <span className="text-mute">Esta página no existe.</span>
      </h1>
      <ButtonLink href="/" className="mt-10" arrow>
        Volver al inicio
      </ButtonLink>
    </main>
  );
}
