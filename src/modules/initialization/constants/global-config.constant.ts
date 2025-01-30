export interface GlobalConfig {
  readonly key: string;
  readonly value: string;
  readonly description: string;
}

export const GLOBAL_CONFIG: readonly GlobalConfig[] = [
  {
    key: 'admin_soft_url',
    value: 'suppli.odoo.com/api/v1',
    description:
      'Url principal para el API del software administrativo de la casa matriz para llevar control del cliente',
  },
] as const;
