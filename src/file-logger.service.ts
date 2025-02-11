import { LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class FileLogger implements LoggerService {
  private logStream: fs.WriteStream;

  constructor() {
    const logDir = path.join(__dirname, '../../../logs');
    fs.mkdirSync(logDir, { recursive: true });

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
    try {
      const timestamp = new Date().toISOString();
      const log = {
        timestamp,
        level,
        context: context || 'Application',
        message,
        ...(trace && { trace }),
      };

      if (!this.logStream) {
        this.logStream = fs.createWriteStream(this.getLogFilePath(), {
          flags: 'a',
        });
      }

      this.logStream.write(`${JSON.stringify(log)}\n`);
    } catch (error) {
      console.error(`Error writing to log file: ${error.message}`);
    }
  }

  private getLogFilePath(): string {
    const logDir = path.join(__dirname, '../../../logs');
    const logFile = path.join(
      logDir,
      `${new Date().toISOString().split('T')[0]}.log`,
    );
    return logFile;
  }
}
