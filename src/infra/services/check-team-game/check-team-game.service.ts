import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import { Cron, CronExpression } from '@nestjs/schedule';
import 'dotenv/config';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue } from 'bull';
import { filterUniqueTimes } from 'src/utils/filterUniqueTimes';

const QUEUE_NAME = process.env.CHECK_QUEUE_NAME;
const JOB_NAME = 'process-check-game-job';

@Injectable()
@Processor(QUEUE_NAME)
export class CheckTeamGameService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAME)
    private readonly queue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async runJob() {
    const urls = process.env.TEAMS_API_URL.split(',');
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

    const tableRowSelector = '.imso-loa.imso-hov';
    await page.waitForSelector(tableRowSelector);

    let rows;
    let teamsData = await page.evaluate(async (tableRowSelector: string) => {
      rows = document.querySelectorAll(tableRowSelector);

      const data = [];

      rows.forEach((row) => {
        const positionElement = row.querySelector('td:nth-child(2) .iU5t0d');
        const nameElement = row.querySelector('td:nth-child(3) .ellipsisize');
        const inGameElement = row.querySelector('.GXDoWd.Ycf7w.OGs04e.de0OAd');

        if (inGameElement) {
          const position = positionElement.innerText;
          const name = nameElement.innerText;
          const inGame = true;
          const scoreboard = inGameElement.innerText;

          data.push({
            name,
            position,
            inGame,
            scoreboard,
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

    teamsData = filterUniqueTimes(teamsData);
    console.log(teamsData);
    await browser.close();
    console.log('Dados da liga ' + teamsData[0].leagueName + ' com sucesso');
  }
}
