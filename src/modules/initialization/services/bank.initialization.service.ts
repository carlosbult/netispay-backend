import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BANK_LIST } from '../constants/bank-list.constant';
import { banks } from '@prisma/client';

@Injectable()
export class BankInitializationService {
  private readonly logger = new Logger(BankInitializationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Inicializa y actualiza los bancos en el sistema
   * @returns Promise<void>
   */
  async initialize(): Promise<void> {
    try {
      this.logger.log('Iniciando sincronización de bancos...');

      const existingBanks = await this.prisma.banks.findMany();
      const existingBanksByCode = new Map(
        existingBanks.map((bank) => [bank.code, bank]),
      );

      // Procesar cada banco de la lista constante
      for (const bankData of BANK_LIST) {
        const existingBank = existingBanksByCode.get(bankData.code);

        if (!existingBank) {
          // Crear nuevo banco si no existe
          await this.createBank(bankData);
        } else if (existingBank.name !== bankData.name) {
          // Actualizar nombre si es diferente
          await this.updateBankName(existingBank.code, bankData.name);
        }
      }

      this.logger.log('Sincronización de bancos completada exitosamente');
    } catch (error) {
      this.logger.error('Error durante la sincronización de bancos', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo banco en el sistema
   * @param bankData Datos del banco a crear
   */
  private async createBank(bankData: {
    name: string;
    code: string;
  }): Promise<void> {
    try {
      await this.prisma.banks.create({
        data: {
          name: bankData.name,
          code: bankData.code,
        },
      });
      this.logger.verbose(`Banco creado: ${bankData.name} (${bankData.code})`);
    } catch (error) {
      this.logger.error(`Error al crear banco ${bankData.code}`, error);
      throw error;
    }
  }

  /**
   * Actualiza el nombre de un banco existente
   * @param code Código del banco
   * @param newName Nuevo nombre del banco
   */
  private async updateBankName(code: string, newName: string): Promise<void> {
    try {
      await this.prisma.banks.update({
        where: { code },
        data: { name: newName },
      });
      this.logger.verbose(
        `Nombre del banco actualizado: ${code} -> ${newName}`,
      );
    } catch (error) {
      this.logger.error(`Error al actualizar nombre del banco ${code}`, error);
      throw error;
    }
  }

  /**
   * Obtiene un banco por su código
   * @param code Código del banco
   * @returns Promise<banks | null>
   */
  async getBankByCode(code: string): Promise<banks | null> {
    try {
      return await this.prisma.banks.findUnique({
        where: { code },
      });
    } catch (error) {
      this.logger.error(`Error al buscar banco ${code}`, error);
      return null;
    }
  }
}
