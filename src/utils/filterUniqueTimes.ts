import { Team } from '@prisma/client';

export const filterUniqueTimes = (teamsData: Team[]): Team[] => {
  const seen = new Set();
  return teamsData.filter((team) => {
    const key = `${team.position}-${team.name}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
