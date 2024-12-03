import { Match } from '@prisma/client';

interface IHasMatchEnded {
  matchTeams: Match[];
  matchesOccoringNow: any[];
}

export default function hasMatchEnded(data: IHasMatchEnded): Match[] {
  const { matchTeams, matchesOccoringNow } = data;

  const endedMatches = matchTeams.filter((match) => {
    const matchIsOccurring = matchesOccoringNow.find(
      (matchOccurring) =>
        matchOccurring.teamName === match.teamName &&
        matchOccurring.adversaryName === match.adversaryName,
    );

    return !matchIsOccurring;
  });

  return endedMatches;
}
