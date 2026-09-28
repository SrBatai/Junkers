import type { Team } from "@/lib/teams";

type CrestProps = {
  team: Team;
  size?: "sm" | "md" | "lg";
  /** Highlight the tag (the viewer's pick). */
  picked?: boolean;
  className?: string;
};

const sizes = {
  sm: "h-8 w-10 text-[10px] [--cut:5px]",
  md: "h-11 w-12 text-xs [--cut:7px]",
  lg: "h-16 w-[4.5rem] text-base [--cut:9px]",
};

/** Neutral broadcast-style tag. No team logos or colours are reproduced. */
export function Crest({ team, size = "md", picked = false, className = "" }: CrestProps) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center font-mono font-semibold tracking-tight chamfer ${
        picked ? "bg-pink text-ink" : "bg-ink-4 text-chalk"
      } ${sizes[size]} ${className}`}
    >
      {team.code}
    </span>
  );
}
