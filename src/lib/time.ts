import { DateTime } from "luxon";

const london = "Europe/London";

export function formatLondon(iso: string) {
  return DateTime.fromISO(iso, { zone: "utc" }).setZone(london).toFormat("ccc d LLL, HH:mm ZZZZ");
}

export function londonClock(now: DateTime = DateTime.now()) {
  return now.setZone(london).toFormat("HH:mm ZZZZ");
}

export function formatRelativeTime(isoOrDate: string | Date | undefined | null): string {
  if (!isoOrDate) return "Now";
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(Math.max(0, diffMs) / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return "Now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return diffHours === 1 ? "1 hour" : `${diffHours} hours`;
  if (diffDays < 7) return diffDays === 1 ? "1 day" : `${diffDays} days`;
  if (diffWeeks < 4) return diffWeeks === 1 ? "1 week" : `${diffWeeks} weeks`;
  if (diffMonths < 12) return diffMonths === 1 ? "1 month" : `${diffMonths} months`;
  return `${Math.floor(diffDays / 365)}y`;
}

export function relativeLondon(iso: string, now: DateTime = DateTime.now()) {
  if (!iso) return "recently";
  const target = DateTime.fromISO(iso, { zone: "utc" }).setZone(london);
  const nowLondon = now.setZone(london);
  const isPast = target < nowLondon;
  const diff = target.diff(nowLondon, ["days", "hours", "minutes"]).toObject();

  const totalMinutes = Math.trunc(Math.abs(target.diff(nowLondon, "minutes").minutes ?? 0));
  const diffHours = Math.floor(totalMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  let label = "just now";
  if (totalMinutes < 1) {
    label = "just now";
  } else if (totalMinutes < 60) {
    label = `${totalMinutes}m`;
  } else if (diffHours < 24) {
    label = diffHours === 1 ? "1 hour" : `${diffHours} hours`;
  } else if (diffDays < 7) {
    label = diffDays === 1 ? "1 day" : `${diffDays} days`;
  } else if (diffWeeks < 4) {
    label = diffWeeks === 1 ? "1 week" : `${diffWeeks} weeks`;
  } else if (diffMonths < 12) {
    label = diffMonths === 1 ? "1 month" : `${diffMonths} months`;
  } else {
    label = `${Math.floor(diffDays / 365)}y`;
  }

  if (label === "just now") return label;
  return isPast ? `${label} ago` : `in ${label}`;
}
