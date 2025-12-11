import { connectionManager } from '../../db';

export async function findProfileByAthleteId(athleteId: string) {
  return connectionManager.prisma.athleteProfile.findUnique({
    where: { athleteId }
  });
}
