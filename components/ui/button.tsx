import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";

type Variant = "primary" | "secondary";
type Size = "sm" | "md" | "lg";

const base =
  "group chamfer [--cut:10px] inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap font-extrabold uppercase tracking-[0.04em] [font-stretch:75%] transition-[background-color,color,transform] duration-200 ease-snap active:translate-y-px active:scale-[0.99]";

const variants: Record<Variant, string> = {
  primary: "bg-pink text-ink hover:bg-pink-soft",
  secondary: "bg-white/[0.07] text-chalk hover:bg-white/[0.13]",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-[15px] sm:px-6",
  lg: "h-14 px-8 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type ButtonLinkProps = React.ComponentProps<"a"> & {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  arrow = false,
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRightIcon
          aria-hidden
          weight="bold"
          className="size-[18px] transition-transform duration-200 ease-snap group-hover:translate-x-0.5"
        />
      )}
    </>
  );
  // Internal routes get client-side navigation; hashes and external URLs stay plain links.
  if (props.href?.startsWith("/") && !props.href.startsWith("/#")) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <a className={buttonClass(variant, size, className)} {...props}>
      {content}
    </a>
  );
}

/** The one "play" CTA used everywhere on the page. */
export function PlayButton(props: Omit<ButtonLinkProps, "href" | "children" | "arrow">) {
  return (
    <ButtonLink href={site.playUrl} arrow {...props}>
      Jugar gratis
    </ButtonLink>
  );
}
