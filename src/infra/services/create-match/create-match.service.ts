import * as puppeteer from 'puppeteer';

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
interface IMatch {
  teamName: string;
  adversaryName: string;
  goalsFor: number;
  goalsAgainst: number;
  leagueName: string;
}

export default async function createMatchService(
  team: string,
  scoreboard: string,
  leagueName: string,
  page: puppeteer.Page,
): Promise<IMatch> {
  const name = replaceSpacesWithPlus(team);

  const url = `https://www.google.com/search?q=${name}+${scoreboard}+${leagueName}+hoje`;

  await page.goto(url);

  await page.waitForSelector('.ellipsisize.kno-fb-ctx');
  const teams = await page.$$eval(
    '.ellipsisize.liveresults-sports-immersive__team-name-width > span',
    (elements) => elements.map((element) => element.innerText),
  );

  const adversaryName = team === teams[0] ? teams[1] : teams[0];

  const { goalsFor, goalsAgainst } = parseScoreboard(scoreboard);

  const match: IMatch = {
    teamName: team,
    adversaryName: adversaryName,
    goalsFor: goalsFor,
    goalsAgainst: goalsAgainst,
    leagueName,
  };
  page.close();

  return match;
}
