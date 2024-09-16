import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import { Cron, CronExpression } from '@nestjs/schedule';
import 'dotenv/config';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue } from 'bull';
import { filterUniqueItems } from 'src/utils/filterUniqueTimes';

const QUEUE_NAME = process.env.SAVE_QUEUE_NAME;
const JOB_NAME = 'process-team-job';

@Injectable()
@Processor(QUEUE_NAME)
export class SaveTeamDataService implements OnModuleInit, OnModuleDestroy {
  private browser: puppeteer.Browser;

  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAME)
    private readonly queue: Queue,
  ) {}

  async onModuleInit() {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async runJob() {
    const urls = process.env.TEAMS_API_URL.split(',');
    await Promise.all(urls.map((url) => this.queue.add(JOB_NAME, { url })));
  }

  @Process(JOB_NAME)
  async processQueue(job: any) {
    const { url } = job.data;

    const page = await this.browser.newPage();
    await page.goto(url);

    page.evaluate(() => {
      if (document.querySelector('.mjkhcd.OSrXXb')) {
        const button = document.querySelector('.mjkhcd.OSrXXb') as HTMLElement;
        return button.click();
      }
      const button = document.querySelector('.z1asCe.QFl0Ff') as HTMLElement;
      return button.click();
    });

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
          }
        });

        return data;
      },
      tableRowSelector,
      leagueSelector,
    );

    await page.close();

    teamsData = filterUniqueItems(
      teamsData,
      (team) => `${team.position}-${team.name}`,
    );

    try {
      for (const teamData of teamsData) {
        await this.prisma.team.upsert({
          where: { name: teamData.name },
          update: {
            points: teamData.points,
            position: teamData.position,
            matchesPlayeds: teamData.matchesPlayeds,
            matchesWon: teamData.matchesWon,
            matchesDrawn: teamData.matchesDrawn,
            matchesLost: teamData.matchesLost,
            goalsFor: teamData.goalsFor,
            goalsAgainst: teamData.goalsAgainst,
            goalDifference: teamData.goalDifference,
          },
          create: {
            name: teamData.name,
            leagueName: teamData.leagueName,
            points: teamData.points,
            position: teamData.position,
            matchesPlayeds: teamData.matchesPlayeds,
            matchesWon: teamData.matchesWon,
            matchesDrawn: teamData.matchesDrawn,
            matchesLost: teamData.matchesLost,
            goalsFor: teamData.goalsFor,
            goalsAgainst: teamData.goalsAgainst,
            goalDifference: teamData.goalDifference,
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
    const remainingJobs = await this.queue.count();
    if (remainingJobs === 0) {
      console.log(
        'Todos os jobs de check team foram processados, fechando o browser...',
      );
      await this.browser.close();
      this.browser = null;
    }
  }
}
