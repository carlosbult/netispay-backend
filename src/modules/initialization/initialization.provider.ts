import { Injectable, OnModuleInit, Provider } from '@nestjs/common';
import { InitializationService } from './initialization.service';

@Injectable()
export class InitializationRunner implements OnModuleInit {
  constructor(private readonly initService: InitializationService) {}

  async onModuleInit() {
    try {
      await this.initService.initialize();
    } catch (error) {
      console.error(
        'Error fatal durante la inicialización del sistema:',
        error,
      );
      // Forzar la terminación de la aplicación si la inicialización falla
      process.exit(1);
    }
  }
}

export const InitializationProvider: Provider = {
  provide: 'INITIALIZATION_RUNNER',
  useFactory: (initService: InitializationService) => {
    return new InitializationRunner(initService);
  },
  inject: [InitializationService],
};
