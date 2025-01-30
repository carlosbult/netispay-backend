import { NetworkManager } from './network-manager.interface';

export interface NetworkManagerFactory {
  createNetworkManager(type: string): NetworkManager;
}
