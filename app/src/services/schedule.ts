import { getWeekBounds } from './date';
import type { WeekView } from './types';
import { mockWeek } from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export async function fetchWeekSchedule(clientId: string, baseDate: Date, timeZone: string): Promise<WeekView> {
  const { startDate, endDate, today, timezone } = getWeekBounds(baseDate, timeZone);
  const url = `${API_BASE}/clients/${clientId}/schedule?weekStart=${startDate}&timezone=${encodeURIComponent(timezone)}`;

  if (USE_MOCKS) {
    return mockWeek;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load schedule (${res.status})`);
    }
    const data = await res.json();
    return {
      startDate: data.weekStart ?? startDate,
      endDate: data.weekEnd ?? endDate,
      timezone: data.timezone ?? timezone,
      today,
      sessions: data.sessions ?? [],
    };
  } catch (err) {
    console.warn('Schedule fetch failed, falling back to mock data', err);
    return mockWeek;
  }
}
