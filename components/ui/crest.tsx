import type { Team } from "@/lib/teams";

type CrestProps = {
  team: Team;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-8 w-8 text-[11px] [--cut:5px]",
  md: "h-11 w-11 text-[13px] [--cut:7px]",
  lg: "h-16 w-16 text-lg [--cut:9px]",
};

/** Neutral broadcast-style crest: code on graphite, club colour as a thin bar. */
export function Crest({ team, size = "md", className = "" }: CrestProps) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center bg-ink-4 font-mono font-semibold tracking-tight text-chalk chamfer ${sizes[size]} ${className}`}
    >
      {team.code}
      <span className="absolute inset-x-0 bottom-0 h-[3px]" style={{ backgroundColor: team.color }} />
    </span>
  );
}
