import { HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { CustomException } from 'src/common/exceptions/custom-exception';
import { ErrorCode } from 'src/interfaces/errorCodes';

export async function getNetworkManagerConfig(
  prisma: PrismaService,
  encryptionService: EncryptionService,
  networkManagerName: string,
): Promise<{
  apiUrl: string;
  apiKey: string;
  apiSecret?: string;
}> {
  const activeIsp = await prisma.isp.findFirst({
    where: { is_active: true },
    include: { network_manager: true },
  });

  if (!activeIsp || !activeIsp.network_manager) {
    throw new CustomException({
      message:
        'No se encontró un ISP activo o un administrador de red asociado',
      statusCode: HttpStatus.NOT_FOUND,
      errorCode: ErrorCode.NOT_FOUND,
    });
  }

  const { network_manager } = activeIsp;

  if (network_manager.name !== networkManagerName) {
    throw new CustomException({
      message: `El administrador de red activo no es ${networkManagerName}`,
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: ErrorCode.BAD_REQUEST,
    });
  }

  if (!network_manager.api_url || !network_manager.api_key) {
    throw new CustomException({
      message: 'Faltan datos de configuración del administrador de red',
      statusCode: HttpStatus.BAD_REQUEST,
      errorCode: ErrorCode.BAD_REQUEST,
    });
  }

  const config: {
    apiUrl: string;
    apiKey: string;
    apiSecret?: string;
  } = {
    apiUrl: network_manager.api_url,
    apiKey: encryptionService.decrypt(network_manager.api_key),
  };

  if (network_manager.api_secret) {
    config.apiSecret = encryptionService.decrypt(network_manager.api_secret);
  }

  return config;
}
