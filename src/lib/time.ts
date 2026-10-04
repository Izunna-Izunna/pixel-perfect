import { DateTime } from "luxon";

const london = "Europe/London";

export function formatLondon(iso: string) {
  return DateTime.fromISO(iso, { zone: "utc" }).setZone(london).toFormat("ccc d LLL, HH:mm ZZZZ");
}

export function londonClock(now: DateTime = DateTime.now()) {
  return now.setZone(london).toFormat("HH:mm ZZZZ");
}

export function relativeLondon(iso: string, now: DateTime = DateTime.now()) {
  const target = DateTime.fromISO(iso, { zone: "utc" }).setZone(london);
  const diff = target.diff(now.setZone(london), ["hours", "minutes"]).toObject();
  const hours = Math.trunc(Math.abs(diff.hours ?? 0));
  const minutes = Math.trunc(Math.abs(diff.minutes ?? 0));
  const label = `${hours}h ${minutes}m`;
  return target < now.setZone(london) ? `${label} ago` : `in ${label}`;
}
