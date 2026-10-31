import { format } from "date-fns";
import { enGB } from "date-fns/locale";

type MoneyOptions = {
  pence?: boolean;
  compact?: boolean;
};

const currencySymbols: Record<string, string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
};

function grouped(value: number, digits: number): string {
  const [whole = "0", fraction] = Math.abs(value).toFixed(digits).split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${withCommas}.${fraction}` : withCommas;
}

export function formatMoney(
  value: number,
  currency: string,
  options: MoneyOptions = {},
): string {
  const symbol = currencySymbols[currency] ?? `${currency} `;
  const sign = value < 0 ? "-" : "";
  if (options.compact) {
    const absolute = Math.abs(value);
    const scaled = absolute >= 1000 ? absolute / 1000 : absolute;
    const suffix = absolute >= 1000 ? "k" : "";
    return `${sign}${symbol}${scaled.toFixed(2)}${suffix}`;
  }
  return `${sign}${symbol}${grouped(value, options.pence ? 2 : 0)}`;
}

export function formatNumber(value: number, compact = false): string {
  const sign = value < 0 ? "-" : "";
  if (compact) {
    const absolute = Math.abs(value);
    return `${sign}${absolute >= 1000 ? `${(absolute / 1000).toFixed(1)}k` : grouped(value, 0)}`;
  }
  return `${sign}${grouped(value, 0)}`;
}

export function formatPercent(value: number, digits: 1 | 2 = 1): string {
  return `${grouped(value, digits)}%`;
}

export function formatPoints(value: number): string {
  return `${new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} pts`;
}

export function formatPosition(from: number, to: number): string {
  const position = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${position.format(from)} → ${position.format(to)}`;
}

export function formatDate(value: Date): string {
  return format(value, "d MMM", { locale: enGB });
}

export function formatDateTime(value: Date): string {
  return format(value, "d MMM HH:mm", { locale: enGB });
}

export function formatRange(start: Date, end: Date): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}
