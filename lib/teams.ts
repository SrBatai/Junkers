export type Team = {
  id: string;
  name: string;
  /** Three-letter broadcast code shown on the crest. */
  code: string;
  /** Club colour, used only as a thin identification bar on the crest. */
  color: string;
  /** Rough 0-100 strength used by the demo simulator. Not real data. */
  rating: number;
};

export type LeagueId = "laliga" | "premier";

export type League = {
  id: LeagueId;
  name: string;
  teams: Team[];
};

export const leagues: Record<LeagueId, League> = {
  laliga: {
    id: "laliga",
    name: "LaLiga",
    teams: [
      { id: "rma", name: "Real Madrid", code: "RMA", color: "#e8e6df", rating: 90 },
      { id: "bar", name: "Barcelona", code: "BAR", color: "#a50044", rating: 89 },
      { id: "atm", name: "Atlético", code: "ATM", color: "#cb3524", rating: 82 },
      { id: "ath", name: "Athletic", code: "ATH", color: "#ee2523", rating: 76 },
      { id: "vil", name: "Villarreal", code: "VIL", color: "#ffe667", rating: 76 },
      { id: "bet", name: "Real Betis", code: "BET", color: "#0bb363", rating: 72 },
      { id: "rso", name: "Real Sociedad", code: "RSO", color: "#0067b1", rating: 70 },
      { id: "cel", name: "Celta", code: "CEL", color: "#8ac3ee", rating: 66 },
      { id: "sev", name: "Sevilla", code: "SEV", color: "#d6001c", rating: 65 },
      { id: "val", name: "Valencia", code: "VAL", color: "#ee7d00", rating: 64 },
      { id: "osa", name: "Osasuna", code: "OSA", color: "#d91a21", rating: 62 },
      { id: "get", name: "Getafe", code: "GET", color: "#005999", rating: 60 },
    ],
  },
  premier: {
    id: "premier",
    name: "Premier League",
    teams: [
      { id: "ars", name: "Arsenal", code: "ARS", color: "#ef0107", rating: 89 },
      { id: "liv", name: "Liverpool", code: "LIV", color: "#c8102e", rating: 88 },
      { id: "mci", name: "Man City", code: "MCI", color: "#6cabdd", rating: 87 },
      { id: "che", name: "Chelsea", code: "CHE", color: "#034694", rating: 80 },
      { id: "new", name: "Newcastle", code: "NEW", color: "#e8e6df", rating: 76 },
      { id: "avl", name: "Aston Villa", code: "AVL", color: "#95bfe5", rating: 75 },
      { id: "tot", name: "Tottenham", code: "TOT", color: "#e8e6df", rating: 73 },
      { id: "mun", name: "Man United", code: "MUN", color: "#da291c", rating: 72 },
      { id: "bha", name: "Brighton", code: "BHA", color: "#0057b8", rating: 70 },
      { id: "cry", name: "Crystal Palace", code: "CRY", color: "#1b458f", rating: 68 },
      { id: "bre", name: "Brentford", code: "BRE", color: "#e30613", rating: 66 },
      { id: "whu", name: "West Ham", code: "WHU", color: "#7a263a", rating: 64 },
    ],
  },
};
