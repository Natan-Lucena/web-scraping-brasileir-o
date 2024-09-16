import * as puppeteer from 'puppeteer';

interface IMatch {
  teamName: string;
  adversaryName: string;
  goalsFor: number;
  goalsAgainst: number;
}

function replaceSpacesWithPlus(input: string): string {
  return input.replace(/\s+/g, '+');
}

function parseScoreboard(scoreboard: string): {
  goalsFor: number;
  goalsAgainst: number;
} {
  const [goalsFor, goalsAgainst] = scoreboard
    .split('-')
    .map((score) => parseInt(score, 10));
  return { goalsFor, goalsAgainst };
}

export default async function createMatch(
  team: string,
  scoreboard: string,
  page: puppeteer.Page,
): Promise<IMatch> {
  const name = replaceSpacesWithPlus(team);

  const url = `https://www.google.com/search?q=${name}+futebol+clube+${scoreboard}+ao+vivo`;

  await page.goto(url);

  await page.waitForSelector('.ellipsisize.kno-fb-ctx');
  const teams = await page.$$eval(
    '.ellipsisize.liveresults-sports-immersive__team-name-width > span',
    (elements) => elements.map((element) => element.innerText),
  );

  const adversaryName = team === teams[0] ? teams[1] : teams[0];

  const { goalsFor, goalsAgainst } = parseScoreboard(scoreboard);
  console.log(
    `O time ${team} está jogando contra o ${adversaryName} e o placar está ${goalsFor} x ${goalsAgainst}`,
  );

  const match: IMatch = {
    teamName: team,
    adversaryName: adversaryName,
    goalsFor: goalsFor,
    goalsAgainst: goalsAgainst,
  };

  page.close();

  return match;
}
