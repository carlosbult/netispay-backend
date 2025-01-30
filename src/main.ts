import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { CustomExceptionFilter } from './common/filters/custom-exception.filter';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { PORT } from './config';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import * as fs from 'fs';
import * as path from 'path';
import { FileLogger } from './file-logger.service';

let app: NestFastifyApplication;

async function bootstrap() {
  try {
    dotenv.config();

    // Crear directorio de logs si no existe
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
      {
        logger: new FileLogger(),
        bufferLogs: true, // Almacena logs en buffer hasta que la app esté lista
      },
    );

    // Configurar el logger global
    const logger = new Logger('Bootstrap');
    app.useLogger(logger);

    // Configurar el manejo de señales para cierre graceful
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        try {
          if (app) {
            await app.close();
            console.log(`Aplicación cerrada correctamente por señal ${signal}`);
          }
          process.exit(0);
        } catch (err) {
          console.error('Error al cerrar la aplicación:', err);
          process.exit(1);
        }
      });
    });

    app.useGlobalFilters(new CustomExceptionFilter());
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.register(fastifyCookie);
    await app.register(fastifyCors, {
      origin: true,
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle('SUPPLI SYSTEM')
      .setDescription('Development managing swagger for suppli platform')
      .setVersion('1.0')
      .addTag('Session Sign In')
      .addTag('Admin')
      .addTag('Users')
      .addTag('Invoices')
      .addTag('Bank Products')
      .addTag('Currency Rates')
      .addTag('ISP Configuration')
      .addTag('Network Managers')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(PORT, '0.0.0.0');
    logger.log(`Aplicación iniciada en el puerto ${PORT}`);
  } catch (error) {
    console.error(`Error al iniciar la aplicación: ${error}`);
    process.exit(1);
  }
}

bootstrap();
