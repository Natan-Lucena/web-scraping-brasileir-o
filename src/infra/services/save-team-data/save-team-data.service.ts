import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SaveTeamDataService {
  constructor(private prisma: PrismaService) {}

  @Cron('10 * * * * *')
  async execute() {
    const url =
      'https://www.google.com/search?q=tabela+do+brasileirao&oq=tabela+do+brasileirao&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQLhhA0gEINDc3MmowajGoAgCwAgA&sourceid=chrome&ie=UTF-8';

    (async () => {
      const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
      });

      const page = await browser.newPage();
      await page.goto(url);

      const buttonSelector = "//div[contains(text(), 'Mais classificações')]";
      const buttonClicked = await page.evaluate((buttonSelector) => {
        const button = document.evaluate(
          buttonSelector,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null,
        ).singleNodeValue as HTMLElement;
        if (button) {
          button.click();
          return true;
        }
        return false;
      }, buttonSelector);

      if (buttonClicked) {
        console.log("Botão 'Mais classificações' clicado com sucesso");
      } else {
        console.error("Botão 'Mais classificações' não encontrado");
        await browser.close();
        return;
      }

      const tableRowSelector =
        '#spo_es_f > span > div > div.ohxm1 > div > div > div > div > div > div > div:nth-child(2) > div > div.jXpA9e.Ui5IUc > div > div > div.cLR6Wc > table > tbody > tr';
      await page.waitForSelector(tableRowSelector);

      let rows;
      const teamsData = await page.evaluate((tableRowSelector) => {
        rows = document.querySelectorAll(tableRowSelector);
        const data = [];

        rows.forEach((row) => {
          const positionElement = row.querySelector('td:nth-child(2) .iU5t0d');
          const nameElement = row.querySelector('td:nth-child(3) .ellipsisize');
          const ptsElement = row.querySelector('td:nth-child(4) div');
          const pjElement = row.querySelector('td:nth-child(5) div');
          const vitElement = row.querySelector('td:nth-child(6) div');
          const eElement = row.querySelector('td:nth-child(7) div');
          const derElement = row.querySelector('td:nth-child(8) div');
          const gmElement = row.querySelector('td:nth-child(9) div');
          const gcElement = row.querySelector('td:nth-child(10) div');
          const sgElement = row.querySelector('td:nth-child(11) div');

          if (positionElement) {
            const position = positionElement.innerText;
            const name = nameElement.innerText;
            const points = ptsElement.innerText;
            const matchesPlayeds = pjElement.innerText;
            const matchesWon = vitElement.innerText;
            const matchesDrawn = eElement.innerText;
            const matchesLost = derElement.innerText;
            const goalsFor = gmElement.innerText;
            const goalsAgainst = gcElement.innerText;
            const goalDifference = sgElement.innerText;

            data.push({
              position: Number(position),
              name,
              points: Number(points),
              matchesPlayeds: Number(matchesPlayeds),
              matchesWon: Number(matchesWon),
              matchesDrawn: Number(matchesDrawn),
              matchesLost: Number(matchesLost),
              goalsFor: Number(goalsFor),
              goalsAgainst: Number(goalsAgainst),
              goalDifference: Number(goalDifference),
            });
          } else {
            console.error(
              'Não foi possível encontrar um ou mais elementos em uma linha:',
              row,
            );
          }
        });

        return data;
      }, tableRowSelector);

      console.log('Tabela do Brasileirão:');
      await this.prisma.team.deleteMany();
      await this.prisma.team.createMany({ data: teamsData });

      await browser.close();
      console.log('rodou');
    })();
  }
}
