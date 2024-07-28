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
    ];
    urls.map(async (url) => await this.queue.add(JOB_NAME, { url }));
    console.log('adicionou');
  }

  @Process(JOB_NAME)
  async processQueue(job: any) {
    const { url } = job.data;
    console.log('tratando');
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
      console.error("Botão 'Mais classificações' não encontrado");
      await browser.close();
      return;
    }

    const leagueSelector = '.PZPZlf[data-attrid="title"]';
    const tableRowSelector = '.imso-loa.imso-hov';
    await page.waitForSelector(tableRowSelector);

    let rows;
    let teamsData = await page.evaluate(
      (tableRowSelector: string, leagueSelector: string) => {
        rows = document.querySelectorAll(tableRowSelector);
        const leagueElement = document.querySelector(leagueSelector) as HTMLElement;
        const leagueName = leagueElement ? leagueElement.innerText : 'Unknown League';
        
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

          if (positionElement && nameElement && ptsElement && pjElement && vitElement && eElement && derElement && gmElement && gcElement && sgElement) {
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
      await this.prisma.team.createMany({ data: teamsData });
    } catch (e) {
      console.log(e);
    }

    await browser.close();
    console.log('Dados processados com sucesso');
  }
}