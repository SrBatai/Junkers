/** "17850" -> "17.850 $". Hand-rolled so server and client always agree. */
export function formatCash(value: number) {
  return `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} $`;
}

export const modeLabel = { cashout: "Cashout", final: "Final Round" } as const;
