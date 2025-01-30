import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { COMMISSION_TIERS } from '../constants/commission-tiers.constant';

@Injectable()
export class CommissionInitializationService {
  constructor(private readonly prisma: PrismaService) {}

  async initialize(): Promise<void> {
    const commissionsCount = await this.prisma.commission_tiers.count();
    console.log('commissionsCount', commissionsCount);
    if (commissionsCount > 0) {
      return;
    }
    await Promise.all(
      COMMISSION_TIERS.map((tier) =>
        this.prisma.commission_tiers.create({
          data: {
            min_transactions: tier.min_transactions,
            max_transactions: tier.max_transactions,
            operation_cost: tier.operation_cost,
            is_active: tier.is_active,
          },
        }),
      ),
    );
  }
}
