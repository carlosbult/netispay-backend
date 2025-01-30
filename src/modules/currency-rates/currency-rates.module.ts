import { Module } from '@nestjs/common';
import { DolarRateScraper } from './services/dolar-rate-scraper.service';
import { PaymentCalculationService } from './services/payment-calculator.service';
import { DolarRateScraperProvider } from './currency-rates.provider';
import { CurrencyRatesController } from './currency-rate.controller';
import { SessionModule } from '../auth/session/session.module';

@Module({
  imports: [SessionModule],
  controllers: [CurrencyRatesController],
  providers: [
    DolarRateScraper,
    DolarRateScraperProvider,
    PaymentCalculationService,
  ],
  exports: [DolarRateScraper, PaymentCalculationService],
})
export class DolarRateScraperModule {}
