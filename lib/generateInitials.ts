export function generateInitials(name?: string | null): string {
  const words = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "NA";

  const firstInitial = words[0]?.charAt(0).toUpperCase() ?? "";
  const lastInitial =
    words.length > 1 ? words[words.length - 1]?.charAt(0).toUpperCase() ?? "" : "";

  return `${firstInitial}${lastInitial}` || "NA";
}
