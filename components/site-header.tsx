"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { PlayButton } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { nav } from "@/lib/site";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 24));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
          open
            ? "border-white/[0.07] bg-ink"
            : solid
              ? "border-white/[0.07] bg-ink/85 backdrop-blur-md"
              : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
          <Link href="/#top" aria-label="Last Squad, inicio" onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-[15px] font-medium text-mute transition-colors hover:text-chalk"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block">
              <PlayButton size="sm" />
            </span>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center bg-white/[0.07] text-chalk [--cut:7px] chamfer lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <XIcon weight="bold" className="size-5" />
              ) : (
                <ListIcon weight="bold" className="size-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Outside <header>: its backdrop-filter would become the containing block of this fixed panel. */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Menú móvil"
            className="fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col justify-between bg-ink px-4 pt-8 pb-10 sm:px-6 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="flex flex-col gap-1">
              {nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-5xl display text-chalk transition-colors active:text-pink"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <PlayButton className="w-full" onClick={() => setOpen(false)} />
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
