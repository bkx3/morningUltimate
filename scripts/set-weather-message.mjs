#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const timeZone = "America/Los_Angeles";
const [, , text, expiresAt] = process.argv;

if (!text || !expiresAt) {
  console.error('Usage: node scripts/set-weather-message.mjs "Message text" "2026-07-17"');
  console.error('   or: node scripts/set-weather-message.mjs "Message text" "2026-07-17T08:30:00-07:00"');
  process.exit(1);
}

function pacificParts(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => Number(parts.find((part) => part.type === type).value);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function pacificDateTimeToDate(year, month, day, hour, minute, second) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const actual = pacificParts(new Date(utcGuess));
  const actualAsUtc = Date.UTC(
    actual.year,
    actual.month - 1,
    actual.day,
    actual.hour,
    actual.minute,
    actual.second
  );
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);

  return new Date(utcGuess + (desiredAsUtc - actualAsUtc));
}

function parseExpiry(value) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (dateOnly) {
    return pacificDateTimeToDate(
      Number(dateOnly[1]),
      Number(dateOnly[2]),
      Number(dateOnly[3]),
      23,
      59,
      59
    );
  }

  return new Date(value);
}

const expiry = parseExpiry(expiresAt);

if (Number.isNaN(expiry.getTime())) {
  console.error("Expiry must be YYYY-MM-DD or a parseable date-time, ideally with a timezone offset.");
  process.exit(1);
}

if (expiry.getTime() <= Date.now()) {
  console.error("expiresAt must be in the future.");
  process.exit(1);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDir, "..", "weather-message.json");
const message = {
  text,
  expiresAt: expiry.toISOString(),
};

await writeFile(outputPath, `${JSON.stringify(message, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
