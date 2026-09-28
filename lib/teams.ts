export type Team = {
  id: string;
  name: string;
  /** Short tag shown on the crest (max 4 characters). */
  code: string;
  /** Rough 0-100 strength used only by the demo simulator. Not real data. */
  rating: number;
};

/**
 * Teams that have competed on THE FINALS esports circuit (The Grand Major 2025 and the
 * TGM26 qualifiers). This is not the final Grand Major 2026 field.
 */
export const teams: Team[] = [
  { id: "ntmr", name: "NTMR", code: "NTMR", rating: 90 },
  { id: "secret", name: "Team Secret", code: "SCRT", rating: 88 },
  { id: "fnatic", name: "Fnatic", code: "FNC", rating: 85 },
  { id: "ssg", name: "Spacestation Gaming", code: "SSG", rating: 84 },
  { id: "kingzero", name: "KingZero", code: "KZ", rating: 83 },
  { id: "tsm", name: "TSM", code: "TSM", rating: 80 },
  { id: "unphased", name: "Unphased", code: "UNPH", rating: 79 },
  { id: "alliance", name: "Alliance", code: "ALL", rating: 77 },
  { id: "777rs", name: "777rs", code: "777", rating: 76 },
  { id: "vanguard", name: "Vanguard Gaming", code: "VG", rating: 75 },
  { id: "pulsar", name: "Pulsar Esports", code: "PLSR", rating: 74 },
  { id: "mirgg", name: "MIRGG", code: "MIR", rating: 73 },
  { id: "apesquad", name: "Ape Squad", code: "APE", rating: 71 },
  { id: "tsukuyomi", name: "Tsukuyomi", code: "TSKY", rating: 69 },
  { id: "hanabi", name: "Hanabi", code: "HNB", rating: 68 },
  { id: "gunflix", name: "Gunflix", code: "GFX", rating: 66 },
];

export const teamById = Object.fromEntries(teams.map((t) => [t.id, t])) as Record<string, Team>;
