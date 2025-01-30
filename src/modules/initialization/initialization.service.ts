import { Injectable, Logger } from '@nestjs/common';
import { GlobalConfigInitializationService } from './services/global-config.initialization.service';
import { CommissionInitializationService } from './services/commission.initialization.service';
import { BankInitializationService } from './services/bank.initialization.service';
import { NetworkManagerInitializationService } from './services/network-manager.initialization.service';
import { BankProductInitializationService } from './services/bank-product.initialization.service';
import { IspInitializationService } from './services/isp.initialization.service';
import { AdminUserInitializationService } from './services/admin-user.initialization.service';

@Injectable()
export class InitializationService {
  private readonly logger = new Logger(InitializationService.name);

  constructor(
    private readonly globalConfigInitService: GlobalConfigInitializationService,
    private readonly commissionInitService: CommissionInitializationService,
    private readonly bankInitService: BankInitializationService,
    private readonly networkManagerInitService: NetworkManagerInitializationService,
    private readonly bankProductInitService: BankProductInitializationService,
    private readonly ispInitService: IspInitializationService,
    private readonly adminUserInitService: AdminUserInitializationService,
  ) {}

  async initialize(): Promise<void> {
    try {
      this.logger.debug('Iniciando verificación del estado del sistema...');

      this.logger.log('Comenzando proceso de inicialización del sistema...');
      await this.globalConfigInitService.initialize();
      this.logger.verbose('✓ Configuración global inicializada');

      await this.commissionInitService.initialize();
      this.logger.verbose('✓ Niveles de comisión inicializados');

      await this.bankInitService.initialize();
      this.logger.verbose('✓ Bancos inicializados');

      await this.bankProductInitService.initialize();
      this.logger.verbose('✓ Productos bancarios inicializados');

      await this.networkManagerInitService.initialize();
      this.logger.verbose('✓ Administradores de red inicializados');

      await this.ispInitService.initialize();
      this.logger.verbose('✓ ISPs demo inicializados');

      await this.adminUserInitService.initialize();
      this.logger.verbose('✓ Usuario administrador inicializado');

      this.logger.log('Sistema inicializado correctamente ✓');
    } catch (error) {
      this.logger.error('Error durante la inicialización del sistema', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
