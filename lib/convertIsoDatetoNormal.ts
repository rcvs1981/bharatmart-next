export function convertIsoDateToNormal(
  isoDate?: string | number | Date | null
): string {
  if (isoDate === null || isoDate === undefined || isoDate === "") return "";

  const dateObject =
    typeof isoDate === "string" ? new Date(isoDate.trim()) : new Date(isoDate);

  if (Number.isNaN(dateObject.getTime())) return "";

  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const day = String(dateObject.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
