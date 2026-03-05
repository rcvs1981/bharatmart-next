export function generateUserCode(prefix: string, fullName: string): string {
  const normalizedPrefix = prefix.trim().toUpperCase() || "USR";

  const initials =
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase() || "NA";

  const now = new Date();
  const timestampCode = `${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}${now
    .getHours()
    .toString()
    .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}${now.getMilliseconds().toString().padStart(3, "0")}`;

  return `${normalizedPrefix}-${initials}-${timestampCode}`;
}
