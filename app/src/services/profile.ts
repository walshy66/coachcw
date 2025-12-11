import type { Subscription, UserProfile } from './types';
import { mockSubscription, mockUserProfile } from './mockData';

const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? '';
const API_BASE = RAW_API_BASE.endsWith('/') ? RAW_API_BASE.slice(0, -1) : RAW_API_BASE;
const API_ROOT = API_BASE ? `${API_BASE}/api/v1` : '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const ACTOR_ID = import.meta.env.VITE_ATHLETE_ID ?? 'athlete-001';

const PROFILE_URL = API_ROOT ? `${API_ROOT}/profiles/me` : '';

function buildError(message: string) {
  return new Error(message);
}

function mapProfile(data: any): UserProfile {
  const profile = data?.profile ?? data ?? {};
  const fullName = profile.fullName ?? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || 'Athlete';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return {
    id: profile.athleteId ?? profile.id ?? 'unknown',
    fullName,
    username: profile.athleteId ?? profile.email ?? 'athlete',
    email: profile.email ?? 'unknown@example.com',
    role: 'athlete',
    dateOfBirth: null,
    location: profile.timezone ?? undefined,
    avatarUrl: profile.avatarUrl ?? undefined,
    avatarInitials: initials || 'AT'
  };
}

export async function fetchUserProfile(): Promise<UserProfile> {
  if (USE_MOCKS || !PROFILE_URL) {
    return mockUserProfile;
  }

  try {
    const res = await fetch(PROFILE_URL, {
      headers: {
        'x-actor-id': ACTOR_ID
      }
    });
    if (!res.ok) {
      throw buildError(`Profile request failed (${res.status})`);
    }
    const data = await res.json();
    return mapProfile(data);
  } catch (err) {
    console.warn('Profile fetch failed', err);
    throw buildError('Profile data is unavailable right now.');
  }
}

export async function fetchSubscription(): Promise<Subscription> {
  if (USE_MOCKS || !API_ROOT) {
    return mockSubscription;
  }

  // No dedicated subscription endpoint yet; surface a derived status.
  try {
    const profile = await fetchUserProfile();
    return {
      ...mockSubscription,
      userId: profile.id,
      status: 'active',
      planName: 'Coaching Core'
    };
  } catch (err) {
    console.warn('Subscription fetch failed', err);
    throw buildError('Subscription info unavailable');
  }
}
