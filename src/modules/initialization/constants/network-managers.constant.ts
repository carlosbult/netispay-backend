import { NetworkManager } from '../interfaces/network-manager.interface';

export const NETWORK_MANAGERS: readonly NetworkManager[] = [
  {
    name: 'MIKROWISP',
    api_url: 'https://demo.mikrosystem.net/api/v1',
    api_key: 'Smx2SVdkbUZIdjlCUlkxdFo1cUNMQT09',
    api_secret: '',
  },
  {
    name: 'WISPHUB',
    api_url: 'https://api.wisphub.app/api',
    api_key: 'Nt1R5xdR.qdbsqQJyGVtGsVKgsXYPNZtGJdrrKdUZ',
    api_secret: '',
  },
  {
    name: 'ISP_CUBE',
    api_url: '',
    api_key: '',
    api_secret: '',
  },
  {
    name: 'NEOGISP',
    api_url: '',
    api_key: '',
    api_secret: '',
  },
  {
    name: 'HYDRA',
    api_url: '',
    api_key: '',
    api_secret: '',
  },
] as const;
