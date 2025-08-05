import { promises as fs } from 'fs';

import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

import { Logs } from '@ds-types/logs.type';

@Injectable()
export class LoggerService {
  private readonly logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.File({
        filename: `${__dirname}/../../../../logs/combined.log`,
        level: 'info',
      }),
      new winston.transports.File({
        filename: `${__dirname}/../../../../logs/error.log`,
        level: 'error',
      }),
    ],
  });

  async onModuleInit(): Promise<void> {
    await this.verifyDirectory();
    await this.verifyFiles('./logs/combined.log');
    await this.verifyFiles('./logs/error.log');
  }

  public logInfo(message: Logs): void {
    this.logger.info(message);
  }

  public logError(message: Logs): void {
    this.logger.error(message);
  }

  private async verifyDirectory(): Promise<void> {
    try {
      await fs.access('./logs');
    } catch {
      await fs.mkdir('./logs', { recursive: true });
    }
  }

  private async verifyFiles(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, '');
    }
  }
}
