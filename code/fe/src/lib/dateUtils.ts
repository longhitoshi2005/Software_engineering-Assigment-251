/**
 * Utility functions for consistent date/time handling across the application
 * All functions handle ISO 8601 strings from backend (UTC) and convert to local time
 */

/**
 * Parse ISO string and ensure it's treated as UTC
 * Backend may return ISO strings without 'Z' suffix, which JS parses as local time
 */
export function parseUTC(isoString: string): Date {
  // If string doesn't end with 'Z' and doesn't have timezone offset, add 'Z' to treat as UTC
  if (!isoString.endsWith('Z') && !isoString.match(/[+-]\d{2}:\d{2}$/)) {
    return new Date(isoString + 'Z');
  }
  return new Date(isoString);
}

/**
 * Format a date to readable string (e.g., "Mon, 15 Jan")
 */
export function formatDate(isoString: string): string {
  const date = parseUTC(isoString);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/**
 * Format a date with year (e.g., "15/01/2024 Monday")
 */
export function formatDateWithYear(isoString: string): string {
  const date = parseUTC(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    weekday: "long",
  });
}

/**
 * Format time only in 24-hour format (e.g., "14:30")
 */
export function formatTime(isoString: string): string {
  const date = parseUTC(isoString);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format full date and time in 24-hour format (e.g., "Mon, 15 Jan 2024, 14:30")
 */
export function formatDateTime(isoString: string): string {
  const date = parseUTC(isoString);
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format a time range in 24-hour format (e.g., "Mon, 15 Jan, 14:00 - 15:30")
 */
export function formatTimeRange(startIso: string, endIso: string): string {
  const start = parseUTC(startIso);
  const end = parseUTC(endIso);
  
  const dateStr = start.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  
  const startTime = start.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  
  const endTime = end.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  
  return `${dateStr}, ${startTime} - ${endTime}`;
}

/**
 * Format time ago (e.g., "15 min ago", "2 hours ago")
 */
export function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Create a local Date object from date and time inputs
 * This ensures consistency when creating datetime from form inputs
 * dateString format: YYYY-MM-DD (from input type="date")
 * timeString format: HH:MM (from input type="time")
 */
export function createLocalDateTime(dateString: string, timeString: string): Date {
  const [hours, minutes] = timeString.split(":").map(Number);
  // Use local date parsing to avoid timezone confusion
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return date;
}

/**
 * Get today's date in YYYY-MM-DD format (for input type="date")
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
