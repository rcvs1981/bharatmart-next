export function generateIsoFormattedDate(
  normalDate: string | number | Date
): string {
  const parsedDate =
    typeof normalDate === "string" ? new Date(normalDate.trim()) : new Date(normalDate);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date provided to generateIsoFormattedDate");
  }

  return parsedDate.toISOString();
}
