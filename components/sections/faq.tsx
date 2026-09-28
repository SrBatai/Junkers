import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { faqs } from "@/lib/content";

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-4">
          <h2 className="text-5xl display sm:text-7xl lg:sticky lg:top-28">
            Preguntas
            <br />
            frecuentes
          </h2>
        </Reveal>

        <Reveal className="lg:col-span-8" delay={0.08}>
          <div className="flex flex-col gap-2">
            {faqs.map((item) => (
              <details key={item.q} name="faq" className="group bg-ink-2 [--cut:14px] chamfer open:bg-ink-3">
                <summary className="flex cursor-pointer items-center justify-between gap-6 px-5 py-5 text-lg font-semibold text-chalk transition-colors hover:text-pink sm:px-7 sm:py-6 sm:text-xl">
                  {item.q}
                  <PlusIcon
                    weight="bold"
                    aria-hidden
                    className="size-5 shrink-0 text-pink transition-transform duration-300 ease-snap group-open:rotate-45"
                  />
                </summary>
                <p className="max-w-[60ch] px-5 pb-6 leading-relaxed text-mute sm:px-7 sm:pb-7">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
