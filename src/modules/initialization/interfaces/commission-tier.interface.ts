export interface CommissionTier {
  readonly min_transactions: number;
  readonly max_transactions: number;
  readonly operation_cost: number;
  readonly is_active: boolean;
} 