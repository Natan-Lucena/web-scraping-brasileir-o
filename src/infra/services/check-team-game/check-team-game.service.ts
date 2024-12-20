import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import { Cron, CronExpression } from '@nestjs/schedule';
import 'dotenv/config';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { filterUniqueItems } from 'src/utils/filterUniqueTimes';
import createMatchService from '../create-match/create-match.service';
import hasMatchEnded from 'src/utils/hasMatchEnded';

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

  @Cron(CronExpression.EVERY_10_SECONDS)
  async runJob() {
    const urls = process.env.TEAMS_API_URL.split(',');
    await Promise.all(urls.map((url) => this.queue.add(JOB_NAME, { url })));
  }

  @Process(JOB_NAME)
  async processQueue(job: any) {
    const { url } = job.data;

    const page = await this.browser.newPage();
    await page.goto(url);

    let leagueSelector: string;
    const elemento = await page.$('.mjkhcd.OSrXXb');
    if (elemento) {
      await elemento.click();
      leagueSelector = '.PZPZlf[data-attrid="title"]';
    } else {
      await page.click('.U8v51e.S3PB2d');
      leagueSelector = '.ofy7ae';
    }
    const tableRowSelector = '.imso-loa.imso-hov';
    await page.waitForSelector(tableRowSelector);

    let rows;
    const teamsData = await page.evaluate(
      async (tableRowSelector: string, leagueSelector: string) => {
        rows = document.querySelectorAll(tableRowSelector);
        const leagueElement = document.querySelector(
          leagueSelector,
        ) as HTMLElement;
        const leagueName = leagueElement
          ? leagueElement.innerText
          : 'Unknown League';

        const match: { name: string; scoreboard: string; league: string }[] =
          [];
        rows.forEach((row) => {
          const nameElement = row.querySelector('td:nth-child(3) .ellipsisize');
          const inGameElements = row.querySelectorAll('.GXDoWd.Ycf7w.OGs04e');

          if (inGameElements.length > 0) {
            const name = nameElement.innerText;
            const scoreboard = inGameElements[0].innerText;

            match.push({
              name,
              scoreboard,
              league: leagueName,
            });
          }
        });

        return { match, leagueName };
      },
      tableRowSelector,
      leagueSelector,
    );

    await page.close();

    teamsData.match = filterUniqueItems(
      teamsData.match,
      (team) => `${team.name}-${team.scoreboard}-${team.league}`,
    );
    console.log('Times encontrados:', teamsData.match);

    const matchsNow = await this.prisma.match.findMany({
      where: { inGame: true, leagueName: teamsData.leagueName },
    });

    const matchesThatEnded = hasMatchEnded({
      matchTeams: matchsNow,
      matchesOccoringNow: teamsData.match,
    });
    await this.prisma.match.updateMany({
      where: { id: { in: matchesThatEnded.map((match) => match.id) } },
      data: { inGame: false },
    });

    for (const team of teamsData.match) {
      try {
        const page = await this.browser.newPage();
        const data = await createMatchService(
          team.name,
          team.scoreboard,
          team.league,
          page,
        );

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
            inGame: true,
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
            User: { select: { email: true } },
          },
        });

        for (const user of interestedUsers) {
          await this.queue.add(JOB_EMAIL_CREATE, {
            user: user.User,
            matchData: data,
          });
        }
        continue;
      } catch (error) {
        console.error(`Erro ao processar o time ${team.name}:`, error.message);
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
