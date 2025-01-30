import { CommissionTier } from '../interfaces/commission-tier.interface';

export const COMMISSION_TIERS: readonly CommissionTier[] = [
  {
    min_transactions: 0,
    max_transactions: 2500,
    operation_cost: 0.5,
    is_active: true,
  },
  {
    min_transactions: 2501,
    max_transactions: 5000,
    operation_cost: 0.45,
    is_active: true,
  },
  {
    min_transactions: 5001,
    max_transactions: 7500,
    operation_cost: 0.41,
    is_active: true,
  },
  {
    min_transactions: 7501,
    max_transactions: 10000,
    operation_cost: 0.36,
    is_active: true,
  },
  {
    min_transactions: 10001,
    max_transactions: 999999999,
    operation_cost: 0.32,
    is_active: true,
  },
] as const;
