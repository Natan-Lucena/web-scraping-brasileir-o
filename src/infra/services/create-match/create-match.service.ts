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
}

export default async function createMatchService(
  team: string,
  scoreboard: string,
): Promise<IMatch> {
  const name = replaceSpacesWithPlus(team);

  const url = `https://www.google.com/search?q=${name}+${scoreboard}`;

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(url);

  await page.waitForSelector('.ellipsisize.kno-fb-ctx');
  const teams = await page.$$eval(
    '.ellipsisize.liveresults-sports-immersive__team-name-width > span',
    (elements) => elements.map((element) => element.innerText),
  );

  const adversaryName = name === teams[0] ? teams[1] : teams[0];

  const { goalsFor, goalsAgainst } = parseScoreboard(scoreboard);
  console.log(
    `O time ${name} está jogando contra o ${adversaryName} e o placar está ${goalsFor} x ${goalsAgainst}`,
  );

  const match: IMatch = {
    teamName: name,
    adversaryName: adversaryName,
    goalsFor: goalsFor,
    goalsAgainst: goalsAgainst,
  };
  await browser.close();

  return match;
}
