import { LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class FileLogger implements LoggerService {
  private logStream: fs.WriteStream;

  constructor() {
    const logDir = path.join(__dirname, '../../../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    const logFile = path.join(
      logDir,
      `${new Date().toISOString().split('T')[0]}.log`,
    );
    this.logStream = fs.createWriteStream(logFile, { flags: 'a' });
  }

  log(message: string, context?: string) {
    this.writeToFile('LOG', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.writeToFile('ERROR', message, context, trace);
  }

  warn(message: string, context?: string) {
    this.writeToFile('WARN', message, context);
  }

  debug(message: string, context?: string) {
    this.writeToFile('DEBUG', message, context);
  }

  verbose(message: string, context?: string) {
    this.writeToFile('VERBOSE', message, context);
  }

  private writeToFile(
    level: string,
    message: string,
    context?: string,
    trace?: string,
  ) {
    const timestamp = new Date().toISOString();
    const log = {
      timestamp,
      level,
      context: context || 'Application',
      message,
      ...(trace && { trace }),
    };

    this.logStream.write(`${JSON.stringify(log)}\n`);
  }
}
