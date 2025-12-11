import { addDays, eachDayOfInterval, endOfWeek, format, startOfMonth, endOfMonth, startOfWeek, differenceInYears } from 'date-fns';
import type { WeekView } from './types';

export const WEEK_START_DAY = 1; // Monday

export function getWeekBounds(base: Date, timeZone: string) {
  const start = startOfWeek(base, { weekStartsOn: WEEK_START_DAY });
  const end = endOfWeek(base, { weekStartsOn: WEEK_START_DAY });
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
    today: format(base, 'yyyy-MM-dd'),
    timezone: timeZone,
  };
}

export function buildWeekDays(startDate: string) {
  const start = new Date(startDate + 'T00:00:00');
  return eachDayOfInterval({ start, end: addDays(start, 6) }).map((d) => format(d, 'yyyy-MM-dd'));
}

export function formatDisplayDate(date: string) {
  return format(new Date(date + 'T00:00:00'), 'EEE MMM d');
}

export function formatDisplayTime(date: string, time: string) {
  // Expects ISO date and time with offset; falls back to showing time string directly
  const dt = new Date(`${date}T${time}`);
  return isNaN(dt.getTime()) ? time : format(dt, 'p');
}

export type CalendarView = 'day' | '3day' | 'week' | 'month';

export function getDatesForView(view: CalendarView, week: WeekView) {
  const today = new Date(week.today + 'T00:00:00');

  if (view === 'day') {
    return [week.today];
  }

  if (view === '3day') {
    return [0, 1, 2].map((offset) => format(addDays(today, offset), 'yyyy-MM-dd'));
  }

  if (view === 'month') {
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));
  }

  // default week
  return buildWeekDays(week.startDate);
}

export function calculateAgeFromDob(dateOfBirth?: string | null) {
  if (!dateOfBirth) return null;

  const dob = new Date(`${dateOfBirth}T00:00:00`);
  if (isNaN(dob.getTime())) return null;

  const now = new Date();
  if (dob > now) return null;

  const years = differenceInYears(now, dob);
  return years >= 0 ? years : null;
}

export function formatFullDate(date?: string | null) {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  return isNaN(parsed.getTime()) ? '' : format(parsed, 'MMM d, yyyy');
}

export function formatRangeLabel(start?: string | null, end?: string | null) {
  const startDate = start ? new Date(`${start}T00:00:00`) : null;
  const endDate = end ? new Date(`${end}T00:00:00`) : null;
  const hasStart = !!startDate && !isNaN(startDate.getTime());
  const hasEnd = !!endDate && !isNaN(endDate.getTime());

  if (hasStart && hasEnd) {
    const sameYear = startDate!.getFullYear() === endDate!.getFullYear();
    const sameMonth = sameYear && startDate!.getMonth() === endDate!.getMonth();
    if (!sameYear) {
      return `${format(startDate!, 'MMM d, yyyy')} – ${format(endDate!, 'MMM d, yyyy')}`;
    }
    if (sameMonth) {
      return `${format(startDate!, 'MMM d')} – ${format(endDate!, 'd, yyyy')}`;
    }
    return `${format(startDate!, 'MMM d')} – ${format(endDate!, 'MMM d, yyyy')}`;
  }

  if (hasStart) {
    return formatFullDate(start) || 'Date not provided';
  }

  if (hasEnd) {
    return formatFullDate(end) || 'Date not provided';
  }

  return 'Dates not provided';
}
