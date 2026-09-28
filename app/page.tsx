import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Audience } from "@/components/sections/audience";
import { Faq } from "@/components/sections/faq";
import { Features } from "@/components/sections/features";
import { FinalCta } from "@/components/sections/final-cta";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Outcomes } from "@/components/sections/outcomes";
import { ResultsTicker } from "@/components/sections/results-ticker";
import { Rewards } from "@/components/sections/rewards";
import { Simulator } from "@/components/sections/simulator";
import { Sports } from "@/components/sections/sports";
import { faqs } from "@/lib/content";
import { site } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
      inLanguage: "es",
      description: site.description,
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <main>
        <Hero />
        <ResultsTicker />
        <HowItWorks />
        <Simulator />
        <Outcomes />
        <Features />
        <Sports />
        <Rewards />
        <Audience />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
