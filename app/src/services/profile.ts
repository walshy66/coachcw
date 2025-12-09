import type { Subscription, UserProfile } from './types';
import { mockSubscription, mockUserProfile } from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const PROFILE_URL = `${API_BASE}/api/profile`;
const SUBSCRIPTION_URL = `${API_BASE}/api/subscription`;

function buildError(message: string) {
  return new Error(message);
}

export async function fetchUserProfile(): Promise<UserProfile> {
  if (USE_MOCKS) {
    return mockUserProfile;
  }

  try {
    const res = await fetch(PROFILE_URL);
    if (!res.ok) {
      throw buildError(`Profile request failed (${res.status})`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Profile fetch failed', err);
    throw buildError('Profile data is unavailable right now.');
  }
}

export async function fetchSubscription(): Promise<Subscription> {
  if (USE_MOCKS) {
    return mockSubscription;
  }

  try {
    const res = await fetch(SUBSCRIPTION_URL);
    if (!res.ok) {
      throw buildError(`Subscription request failed (${res.status})`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Subscription fetch failed', err);
    throw buildError('Subscription info unavailable');
  }
}
