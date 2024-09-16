import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import { Cron, CronExpression } from '@nestjs/schedule';
import 'dotenv/config';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { filterUniqueItems } from 'src/utils/filterUniqueTimes';
import createMatch from 'src/utils/create-match';

const QUEUE_NAME = process.env.CHECK_QUEUE_NAME;
const JOB_NAME = 'process-check-game-job';
const JOB_EMAIL_CREATE = 'send-email-create-job';
const JOB_EMAIL_UPDATE = 'send-email-update-job';

@Injectable()
@Processor(QUEUE_NAME)
export class CheckTeamGameService implements OnModuleInit, OnModuleDestroy {
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

    await page.close();
    teamsData = filterUniqueItems(
      teamsData,
      (team) => `${team.name}-${team.scoreboard}`,
    );

    console.log(teamsData);

    for (const team of teamsData) {
      try {
        const page = await this.browser.newPage();
        const data = await createMatch(team.name, team.scoreboard, page);

        const existingTeam = await this.prisma.team.findUnique({
          where: { name: data.teamName },
        });

        if (!existingTeam) {
          console.error(`Time ${data.teamName} não encontrado na tabela Team`);
          continue;
        }

        const interestedUsers = await this.prisma.userInterest.findMany({
          where: {
            teamName: team.name,
          },
          select: {
            User: { select: { email: true } },
          },
        });

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

          for (const user of interestedUsers) {
            await this.queue.add(JOB_EMAIL_CREATE, {
              user: user.User,
              matchData: data,
            });
          }
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

          for (const user of interestedUsers) {
            await this.queue.add(JOB_EMAIL_UPDATE, {
              user: user.User,
              matchData: data,
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao processar o time ${team.name}:`, error);
      }
    }
    const remainingJobs = await this.queue.count();
    if (remainingJobs === 0) {
      console.log(
        'Todos os jobs de save data foram processados, fechando o browser...',
      );
      await this.browser.close();
      this.browser = null;
    }
  }

  @Process(JOB_EMAIL_UPDATE)
  async handleSendEmailJobUpdate(job: Job) {
    const { user, matchData } = job.data;
    console.log(user);
    console.log(
      `Enviando email para ${user.email} sobre o jogo do time ${matchData.teamName}`,
    );
  }

  @Process(JOB_EMAIL_CREATE)
  async handleSendEmailJobCreate(job: Job) {
    const { user, matchData } = job.data;
    console.log(user);
    console.log(
      `Enviando email para ${user.email} sobre o jogo do time ${matchData.teamName}`,
    );
  }
}
