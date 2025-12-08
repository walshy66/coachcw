import type { MetricSnapshot } from './types';
import { mockMetrics } from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export async function fetchCompletionMetrics(clientId: string, weeks = 4): Promise<MetricSnapshot> {
  const url = `${API_BASE}/clients/${clientId}/metrics/completion?weeks=${weeks}`;

  if (USE_MOCKS) {
    return mockMetrics;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load metrics (${res.status})`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Metrics fetch failed, falling back to mock data', err);
    return mockMetrics;
  }
}
