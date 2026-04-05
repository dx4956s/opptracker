export function formatDate(d: string | null): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export function daysSince(date: string | null): string {
  if (!date) return "—";
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  return diff === 0 ? "Today" : diff === 1 ? "1 day" : `${diff} days`;
}

export function daysBetween(from: string | null, to: string | null): string {
  if (!from || !to) return "—";
  const diff = Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
  return diff < 0 ? "—" : diff === 1 ? "1 day" : `${diff} days`;
}
