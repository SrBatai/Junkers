export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center bg-pink text-[17px] leading-none font-black text-ink [font-stretch:62.5%] [--cut:7px] chamfer"
      >
        LS
      </span>
      <span className="text-[22px] display leading-none tracking-[0.01em]">
        Last<span className="text-pink">Squad</span>
      </span>
    </span>
  );
}
