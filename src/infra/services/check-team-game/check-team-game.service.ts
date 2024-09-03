import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import { Cron, CronExpression } from '@nestjs/schedule';
import 'dotenv/config';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import createMatchService from '../create-match/create-match.service';
import { filterUniqueItems } from 'src/utils/filterUniqueTimes';

const QUEUE_NAME = process.env.CHECK_QUEUE_NAME;
const JOB_NAME = 'process-check-game-job';
const JOB_EMAIL = 'send-email-job';
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

    await page.waitForSelector('.mjkhcd.OSrXXb');
    await page.click('.mjkhcd.OSrXXb');

    const tableRowSelector = '.imso-loa.imso-hov';
    await page.waitForSelector(tableRowSelector);

    let rows;
    let teamsData = await page.evaluate(async (tableRowSelector: string) => {
      rows = document.querySelectorAll(tableRowSelector);

      const data = [];

      rows.forEach((row) => {
        const nameElement = row.querySelector('td:nth-child(3) .ellipsisize');
        const inGameElements = row.querySelectorAll('.GXDoWd.Ycf7w.OGs04e');

        if (inGameElements.length > 0) {
          const name = nameElement.innerText;
          const scoreboard = inGameElements[0].innerText;

          data.push({
            name,
            scoreboard,
          });
        }
      });

      return data;
    }, tableRowSelector);

    teamsData = filterUniqueItems(
      teamsData,
      (team) => `${team.name}-${team.scoreboard}`,
    );

    console.log(teamsData);

    for (const team of teamsData) {
      try {
        const data = await createMatchService(team.name, team.scoreboard);

        const existingTeam = await this.prisma.team.findUnique({
          where: { name: data.teamName },
        });

        if (!existingTeam) {
          console.error(`Time ${data.teamName} não encontrado na tabela Team`);
          continue;
        }

        const match = await this.prisma.match.findFirst({
          where: {
            teamName: data.teamName,
            adversaryName: data.adversaryName,
          },
        });

        if (!match) {
          await this.prisma.match.create({
            data: data,
          });
          continue;
        }

        if (
          match.goalsFor !== data.goalsFor ||
          match.goalsAgainst !== data.goalsAgainst
        ) {
          await this.prisma.match.update({
            where: {
              id: match.id,
            },
            data: data,
          });
        }

        const interestedUsers = await this.prisma.userInterest.findMany({
          where: {
            teamName: team.name,
          },
          select: {
            User: true,
          },
        });
        for (const user of interestedUsers) {
          await this.queue.add(JOB_EMAIL, {
            user: user.User,
            matchData: data,
          });
        }
      } catch (error) {
        console.error(`Erro ao processar o time ${team.name}:`, error);
      }
    }

    await browser.close();
  }

  @Process(JOB_EMAIL)
  async handleSendEmailJob(job: Job) {
    const { user, matchData } = job.data;
    console.log(user);
    console.log(
      `Enviando email para ${user.email} sobre o jogo do time ${matchData.teamName}`,
    );
  }
}
