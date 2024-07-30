import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import { Cron, CronExpression } from '@nestjs/schedule';
import 'dotenv/config';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue } from 'bull';

const QUEUE_NAME = process.env.QUEUE_NAME;
const JOB_NAME = 'process-team-job';

@Injectable()
@Processor(QUEUE_NAME)
export class SaveTeamDataService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAME)
    private readonly queue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async runJob() {
    const urls = [
      'https://www.google.com/search?q=tabela+do+brasileirao&oq=tabela+do+brasileirao&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQLhhA0gEINDc3MmowajGoAgCwAgA&sourceid=chrome&ie=UTF-8',
      'https://www.google.com/search?q=tabela+premier+league&sca_esv=2a9720fd994fa302&sxsrf=ADLYWIIMJeHR6xlUARN1JHZ7tI9oWN3Rog%3A1721851897430&ei=-V-hZsHxGf7R1sQPo5ySCA&ved=0ahUKEwiB0s6VvsCHAxX-qJUCHSOOBAEQ4dUDCA8&uact=5&oq=tabela+premier+league&gs_lp=Egxnd3Mtd2l6LXNlcnAiFXRhYmVsYSBwcmVtaWVyIGxlYWd1ZTIKECMYgAQYJxiKBTIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABEjoHFDiBFjKG3ACeAGQAQCYAasBoAHoEqoBBDAuMTW4AQPIAQD4AQGYAhGgApgTwgIKEAAYsAMY1gQYR8ICDRAAGIAEGLADGEMYigXCAg4QABiwAxjkAhjWBNgBAcICExAuGIAEGLADGEMYyAMYigXYAQLCAgwQIxiABBgTGCcYigXCAhAQABiABBixAxhDGIMBGIoFwgIIEAAYgAQYsQPCAgoQABiABBhDGIoFwgINEAAYgAQYsQMYQxiKBcICDhAAGIAEGLEDGIMBGIoFwgIHECMYsQIYJ8ICBxAAGIAEGAqYAwCIBgGQBhO6BgYIARABGAm6BgYIAhABGAiSBwQyLjE1oAecbg&sclient=gws-wiz-serp',
      'https://www.google.com/search?q=tabela+campeonato+italiano&sca_esv=2a9720fd994fa302&sxsrf=ADLYWILgHmmw4gT41T2FEhTt_Loh7WyooQ%3A1721851911871&ei=B2ChZo_sNMLX1sQP6Ziu4A0&ved=0ahUKEwjPi8CcvsCHAxXCq5UCHWmMC9wQ4dUDCA8&uact=5&oq=tabela+campeonato+italiano&gs_lp=Egxnd3Mtd2l6LXNlcnAiGnRhYmVsYSBjYW1wZW9uYXRvIGl0YWxpYW5vMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABEjkLlDdB1i8LXADeAGQAQGYAbkCoAGeIaoBCDAuMTkuMy4xuAEDyAEA-AEBmAIZoAK5H8ICChAAGLADGNYEGEfCAg0QABiABBiwAxhDGIoFwgIOEAAYsAMY5AIY1gTYAQHCAhMQLhiABBiwAxhDGMgDGIoF2AECwgIKECMYgAQYJxiKBcICDBAjGIAEGBMYJxiKBcICCxAAGIAEGLEDGIMBwgIIEAAYgAQYsQPCAgcQABiABBgKwgIHEAAYgAQYDZgDAIgGAZAGE7oGBggBEAEYCboGBggCEAEYCJIHBjMuMTkuM6AHsJcB&sclient=gws-wiz-serp',
      'https://www.google.com/search?client=opera-gx&q=tabela+MLS&sourceid=opera&ie=UTF-8&oe=UTF-8',
      'https://www.google.com/search?q=tabela+campeonato+saudita&client=opera-gx&hs=ktU&sca_esv=c839f9702c677c11&sxsrf=ADLYWILuwtmHSIg9dlM8csZtcpm0ju1zCQ%3A1722180024052&ei=uGGmZujuArTr1AGUyMq4DA&ved=0ahUKEwjoqsrEhMqHAxW0NTUKHRSkEscQ4dUDCBA&uact=5&oq=tabela+campeonato+saudita&gs_lp=Egxnd3Mtd2l6LXNlcnAiGXRhYmVsYSBjYW1wZW9uYXRvIHNhdWRpdGEyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyCBAAGIAEGMsBMggQABiiBBiJBTIIEAAYogQYiQVI8jdQ5gtYsDdwBngAkAEAmAHtAaAB4x-qAQYwLjIzLjG4AQPIAQD4AQGYAh6gAqYgqAISwgILEAAYgAQYsQMYgwHCAgoQABiABBhDGIoFwgIIEAAYgAQYsQPCAgoQIxiABBgnGIoFwgIOEAAYgAQYsQMYgwEYigXCAgcQIxgnGOoCwgIWEC4YgAQYQxi0AhjIAxiKBRjqAtgBAcICChAuGIAEGEMYigXCAgUQLhiABMICBRAhGKABmAMGugYGCAEQARgIkgcGNi4yMy4xoAfFxQE&sclient=gws-wiz-serp',
      'https://www.google.com/search?q=tabela+serie+b&client=opera-gx&hs=PuU&sca_esv=c839f9702c677c11&sxsrf=ADLYWIKPpvZttkVFG9lnmqE9qHlC2L3fmQ%3A1722180065524&ei=4WGmZt_OH_7Y1sQPi86WsAY&ved=0ahUKEwifw63YhMqHAxV-rJUCHQunBWYQ4dUDCBA&uact=5&oq=tabela+serie+b&gs_lp=Egxnd3Mtd2l6LXNlcnAiDnRhYmVsYSBzZXJpZSBiMgoQIxiABBgnGIoFMggQABiABBixAzIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESJk4UIMeWIU2cAF4AZABAJgBrQGgAa0LqgEDMC45uAEDyAEA-AEBmAIKoALPC8ICChAAGLADGNYEGEfCAg0QABiABBiwAxhDGIoFwgITEC4YgAQYsAMYQxjIAxiKBdgBAcICCxAAGIAEGLEDGIMBwgIKEAAYgAQYQxiKBZgDAIgGAZAGFLoGBggBEAEYCJIHAzEuOaAH800&sclient=gws-wiz-serp',
      'https://www.google.com/search?q=tabela+segunda+divisão+inglesa&client=opera-gx&sca_esv=c839f9702c677c11&sxsrf=ADLYWIIt-n9kzEifVNlNPFJohA-QJPKTfw%3A1722180462400&ei=bmOmZuSKGPvd1sQPrvO0kAs&oq=tabela+segunda+di&gs_lp=Egxnd3Mtd2l6LXNlcnAiEXRhYmVsYSBzZWd1bmRhIGRpKgIIATIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgARI_StQsglYkyNwAXgBkAEAmAGtAaABrRCqAQQwLjEzuAEDyAEA-AEBmAIOoALREMICChAAGLADGNYEGEfCAg0QABiABBiwAxhDGIoFwgIKECMYgAQYJxiKBcICChAAGIAEGEMYigXCAgsQABiABBixAxiDAcICCBAAGIAEGLEDmAMAiAYBkAYKkgcEMS4xM6AH91k&sclient=gws-wiz-serp',
      'https://www.google.com/search?q=tabela+campeonato+frances&client=opera-gx&sca_esv=c839f9702c677c11&sxsrf=ADLYWII50sqZhC4I4TI4F6HOCBH5fbwtRA%3A1722180471785&ei=d2OmZr3UL47L1sQPxqu7sA8&ved=0ahUKEwj964mahsqHAxWOpZUCHcbVDvYQ4dUDCBA&uact=5&oq=tabela+campeonato+frances&gs_lp=Egxnd3Mtd2l6LXNlcnAiGXRhYmVsYSBjYW1wZW9uYXRvIGZyYW5jZXMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESNAlUM8HWMAkcAF4AZABAJgBtgGgAcgZqgEEMC4yMLgBA8gBAPgBAZgCFaAC-xnCAgoQABiwAxjWBBhHwgINEAAYgAQYsAMYQxiKBcICChAjGIAEGCcYigXCAgsQABiABBixAxiDAcICCBAAGIAEGLEDwgIFEC4YgASYAwCIBgGQBgqSBwQxLjIwoAfwoQE&sclient=gws-wiz-serp',
      'https://www.google.com/search?q=tabela+laliga&client=opera-gx&sca_esv=c839f9702c677c11&sxsrf=ADLYWIKegraTt4MllE6cFUWzrS5WRASkDA%3A1722180519140&ei=p2OmZoehCMfN1sQP56fmqAk&ved=0ahUKEwjHkNSwhsqHAxXHppUCHeeTGZUQ4dUDCBA&uact=5&oq=tabela+laliga&gs_lp=Egxnd3Mtd2l6LXNlcnAiDXRhYmVsYSBsYWxpZ2EyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgcQABiABBgKMgUQABiABDIFEAAYgAQyBxAAGIAEGAoyBRAAGIAEMgcQABiABBgKSNaJAVCEEFjghwFwAngBkAEAmAGcAqABmReqAQYwLjE3LjG4AQPIAQD4AQGYAhSgAtQXwgIKEAAYsAMY1gQYR8ICDRAAGIAEGLADGEMYigXCAhMQLhiABBiwAxhDGMgDGIoF2AEBwgIKECMYgAQYJxiKBcICCxAAGIAEGLEDGIMBwgIKEAAYgAQYQxiKBcICCBAAGIAEGLEDmAMAiAYBkAYMugYECAEYCJIHBjIuMTcuMaAHv5oB&sclient=gws-wiz-serp',
      'https://www.google.com/search?q=tabela+portugal&client=opera-gx&sca_esv=c839f9702c677c11&sxsrf=ADLYWIKaKJJUSKFUoPncuxkIBS2dDL38Nw%3A1722180605588&ei=_WOmZoXHI7PY1sQPmPXB0A8&ved=0ahUKEwjFufDZhsqHAxUzrJUCHZh6EPoQ4dUDCBA&uact=5&oq=tabela+portugal&gs_lp=Egxnd3Mtd2l6LXNlcnAiD3RhYmVsYSBwb3J0dWdhbDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgARIvJoBUL0SWPuYAXABeAGQAQCYAagBoAGRC6oBAzAuObgBA8gBAPgBAZgCCqACtQvCAgoQABiwAxjWBBhHwgINEAAYgAQYsAMYQxiKBcICDhAAGLADGOQCGNYE2AEBwgITEC4YgAQYsAMYQxjIAxiKBdgBAsICChAjGIAEGCcYigXCAgsQABiABBixAxiDAcICChAAGIAEGEMYigXCAggQABiABBixA8ICDhAAGIAEGLEDGIMBGIoFmAMAiAYBkAYTugYGCAEQARgJugYGCAIQARgIkgcDMS45oAf_NQ&sclient=gws-wiz-serp',
      'https://www.google.com/search?q=tabela+bundesliga&client=opera-gx&sca_esv=c839f9702c677c11&sxsrf=ADLYWILFmmx5sWWCwptvdPr9W7k4Twt_WA%3A1722180749868&ei=jWSmZrHZNM3U1sQPpJXz4AI&ved=0ahUKEwjx09aeh8qHAxVNqpUCHaTKHCwQ4dUDCBA&uact=5&oq=tabela+bundesliga&gs_lp=Egxnd3Mtd2l6LXNlcnAiEXRhYmVsYSBidW5kZXNsaWdhMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABEizwQFQuy1Y5MABcAF4AZABAJgBhAOgAaQOqgEHMC42LjIuMbgBA8gBAPgBAZgCCqACyA7CAgoQABiwAxjWBBhHwgINEAAYgAQYsAMYQxiKBcICExAuGIAEGLADGEMYyAMYigXYAQHCAhkQLhiABBiwAxjRAxhDGMcBGMgDGIoF2AEBwgIKECMYgAQYJxiKBcICCxAAGIAEGLEDGIMBwgIMECMYgAQYExgnGIoFwgIEECMYJ8ICCBAAGIAEGLEDmAMAiAYBkAYUugYGCAEQARgIkgcHMS41LjMuMaAH5Dc&sclient=gws-wiz-serp',
    ];
    urls.map(async (url) => await this.queue.add(JOB_NAME, { url }));
  }

  @Process(JOB_NAME)
  async processQueue(job: any) {
    const { url } = job.data;
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.goto(url);

    const buttonSelector = "//div[contains(text(), 'Mais classificações')]";
    const buttonClicked = await page.evaluate((buttonSelector: string) => {
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

    if (!buttonClicked) {
      console.error(
        "Botão 'Mais classificações' não encontrado na liga " + url,
      );
      await browser.close();
      return;
    }

    const leagueSelector = '.PZPZlf[data-attrid="title"]';
    const tableRowSelector = '.imso-loa.imso-hov';
    await page.waitForSelector(tableRowSelector);

    let rows;
    let teamsData = await page.evaluate(
      async (tableRowSelector: string, leagueSelector: string) => {
        rows = document.querySelectorAll(tableRowSelector);
        const leagueElement = document.querySelector(
          leagueSelector,
        ) as HTMLElement;
        const leagueName = leagueElement
          ? leagueElement.innerText
          : 'Unknown League';

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

          if (
            positionElement &&
            nameElement &&
            ptsElement &&
            pjElement &&
            vitElement &&
            eElement &&
            derElement &&
            gmElement &&
            gcElement &&
            sgElement
          ) {
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
              leagueName,
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
      },
      tableRowSelector,
      leagueSelector,
    );

    const seen = new Set();
    teamsData = teamsData.filter((team) => {
      const key = `${team.position}-${team.name}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    try {
      await this.prisma.team.deleteMany({
        where: { leagueName: teamsData[0].leagueName },
      });
      await this.prisma.team.createMany({ data: teamsData });
    } catch (e) {
      console.log(e);
    }

    await browser.close();
    console.log('Dados da liga ' + teamsData[0].leagueName + ' com sucesso');
  }
}
