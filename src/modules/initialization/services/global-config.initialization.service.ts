import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { GLOBAL_CONFIG } from '../constants/global-config.constant';
import { global_configuration } from '@prisma/client';

@Injectable()
export class GlobalConfigInitializationService {
  private readonly logger = new Logger(GlobalConfigInitializationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la configuración global del sistema
   * @returns Promise<GlobalConfiguration | null> Retorna la configuración global o null si no existe
   */
  async getConfig(): Promise<global_configuration | null> {
    try {
      // Intentamos obtener la primera configuración global
      // Si existe al menos una, consideramos que el sistema está inicializado
      const config = await this.prisma.global_configuration.findFirst();
      return config;
    } catch (error) {
      this.logger.error('Error al obtener la configuración global', error);
      return null;
    }
  }

  /**
   * Inicializa la configuración global del sistema
   * @returns Promise<void> Retorna una promesa que se cumple cuando se ha inicializado la configuración global
   */
  async initialize(): Promise<void> {
    try {
      const configCount = await this.prisma.global_configuration.count();

      if (configCount > 0) {
        this.logger.log(
          'La configuración global ya existe. Omitiendo inicialización.',
        );
        return;
      }

      this.logger.log('Iniciando creación de configuraciones globales...');
      await Promise.all(
        GLOBAL_CONFIG.map((config) =>
          this.prisma.global_configuration.create({
            data: {
              key: config.key,
              value: config.value,
              description: config.description,
            },
          }),
        ),
      );
      this.logger.log('Configuraciones globales creadas exitosamente');
    } catch (error) {
      this.logger.error(
        'Error al inicializar las configuraciones globales',
        error,
      );
      throw error;
    }
  }
}
