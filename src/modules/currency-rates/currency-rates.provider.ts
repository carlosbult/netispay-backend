import { Provider } from '@nestjs/common';
import { DolarRateScraper } from './services/dolar-rate-scraper.service';

export const DolarRateScraperProvider: Provider = {
  provide: 'DOLAR_RATE_SCRAPER',
  useFactory: async (scraperService: DolarRateScraper) => {
    let intervalId: NodeJS.Timeout | null = null;

    const updateDolarRates = async () => {
      try {
        await scraperService.updateDolarRates();
      } catch (error) {
        console.error('Error scraping rates:', error);
      } finally {
        await scraperService.close();
      }
    };

    if (intervalId) {
      clearInterval(intervalId);
    }

    // Ejecutar inmediatamente al iniciar
    updateDolarRates();

    // Ejecutar cada 30 minutos
    intervalId = setInterval(updateDolarRates, 60 * 60 * 1000);

    process.on('SIGTERM', () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    });
  },
  inject: [DolarRateScraper],
};
