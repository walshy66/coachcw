import { findProfileByAthleteId } from './repository';

export type ProfileDto = {
  athleteId: string;
  fullName: string;
  status: string;
  email?: string | null;
  timezone?: string | null;
  avatarUrl?: string | null;
  updatedAt: string;
};

export async function getProfile(athleteId: string): Promise<ProfileDto | null> {
  const profile = await findProfileByAthleteId(athleteId);
  if (!profile) {
    return null;
  }

  return {
    athleteId: profile.athleteId,
    fullName: `${profile.firstName} ${profile.lastName}`.trim(),
    status: profile.status,
    email: profile.email,
    timezone: profile.timezone,
    avatarUrl: profile.avatarUrl,
    updatedAt: profile.updatedAt.toISOString()
  };
}
