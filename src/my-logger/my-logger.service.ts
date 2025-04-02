import { Injectable, ConsoleLogger } from '@nestjs/common';
import { promises as fsPromises, existsSync } from 'fs';
import * as path from 'path';

@Injectable()
export class MyLoggerService extends ConsoleLogger {
  async logToFile(entry: string, ip?: string) {
    const formattedEntry = `${Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Africa/Nairobi',
    }).format(new Date())} - IP: ${ip || 'unknown'} - ${entry}\n`;

    try {
      const logsPath = path.join(__dirname, '..', '..', 'logs');
      if (!existsSync(logsPath)) {
        await fsPromises.mkdir(logsPath);
      }
      await fsPromises.appendFile(
        path.join(logsPath, 'myLogFile.log'),
        formattedEntry,
      );
    } catch (e) {
      console.error(e instanceof Error ? e.message : e);
    }
  }

  error(message: string | Error, context?: string, ip?: string) {
    const errorMessage = message instanceof Error ? message.message : message;
    const entry = `${context ? `[${context}] ` : ''}${errorMessage}`;
    this.logToFile(entry, ip);
    super.error(errorMessage, context);
  }

  log(message: string, context?: string, ip?: string) {
    const entry = `${context ? `[${context}] ` : ''}${message}`;
    this.logToFile(entry, ip);
    super.log(message, context);
  }

  warn(message: string, context?: string, ip?: string) {
    const entry = `${context ? `[${context}] ` : ''}${message}`;
    this.logToFile(entry, ip);
    super.warn(message, context);
  }
}
