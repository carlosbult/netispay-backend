import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { PrismaService } from 'prisma/prisma.service';
import { PUPPETEER_EXECUTABLE_PATH } from 'src/config/index';

@Injectable()
export class DolarRateScraper {
  private browser: any;
  private page: any;

  constructor(private prisma: PrismaService) {}

  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        executablePath:
          PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });
      this.page = await this.browser.newPage();
    } catch (error) {
      console.error(`Error in initialize DolarRateScraper: ${error}`);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrapeParallel(attempts = 0, maxAttempts = 5) {
    if (attempts >= maxAttempts) {
      console.log(
        `Máximo número de intentos (${maxAttempts}) alcanzado. No se pudo obtener un valor válido.`,
      );
      return null;
    }

    try {
      if (!this.page || this.page.isClosed()) {
        await this.initialize();
      }

      await this.page.goto('https://monitordolarvenezuela.com/', {
        waitUntil: 'networkidle0',
      });

      // Obtener ambas tasas en una sola evaluación con la nueva estructura HTML
      const rates = await this.page.evaluate(() => {
        const containers = document.querySelectorAll(
          '.lg\\:col-span-1.md\\:col-span3.sm\\:col-span-3.col-span-6',
        );
        let bcvRate = null;
        let parallelRate = null;

        containers.forEach((container) => {
          const titleElement = container.querySelector('h3');
          const rateElement = container.querySelector('p.font-bold.text-xl');

          if (!titleElement || !rateElement) return;

          const title = titleElement.textContent?.trim() || '';
          const rateText = rateElement.textContent?.trim() || '';
          const rate = parseFloat(
            rateText.replace('Bs = ', '').replace(',', '.'),
          );

          if (title.includes('Dólar BCV (Oficial)')) {
            bcvRate = rate;
          } else if (title.includes('Dólar Paralelo')) {
            parallelRate = rate;
          }
        });

        return { bcvRate, parallelRate };
      });

      if (
        rates.parallelRate === null ||
        rates.parallelRate === 0 ||
        rates.bcvRate === null ||
        rates.bcvRate === 0
      ) {
        console.log(
          `Intento ${attempts + 1}: Valores no válidos (Parallel: ${rates.parallelRate}, BCV: ${rates.bcvRate}). Reintentando...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return this.scrapeParallel(attempts + 1, maxAttempts);
      }

      return rates;
    } catch (error) {
      console.error(`Error en intento ${attempts + 1}:`, error);
      await this.close();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return this.scrapeParallel(attempts + 1, maxAttempts);
    }
  }

  async updateDolarRates() {
    try {
      await this.initialize();
      const { bcvRate, parallelRate } = await this.scrapeParallel();

      console.log('bcvRate: ', bcvRate);
      console.log('parallelRate: ', parallelRate);

      const lastRate = await this.prisma.dolar_rate.findFirst({
        orderBy: { created_at: 'desc' },
      });

      const newBcvRate =
        bcvRate !== null && bcvRate !== 0 ? bcvRate : lastRate?.bcv_rate;
      const newParallelRate =
        parallelRate !== null && parallelRate !== 0
          ? parallelRate
          : lastRate?.parallel_rate;

      if (!newBcvRate || !newParallelRate) {
        console.log('No se pudo obtener tasas válidas');
        return;
      }

      if (
        !lastRate ||
        lastRate.bcv_rate !== newBcvRate ||
        lastRate.parallel_rate !== newParallelRate
      ) {
        await this.prisma.dolar_rate.create({
          data: {
            bcv_rate: newBcvRate,
            parallel_rate: newParallelRate,
          },
        });
        console.log(
          `New rates saved: BCV Rate: ${newBcvRate}, Parallel Rate: ${newParallelRate}`,
        );
      } else {
        console.log('No changes in rates');
      }
    } catch (error) {
      console.error('Error scraping rates:', error);
    } finally {
      await this.close();
    }
  }
}
