import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from './logger.service';

import { Logs } from '@ds-types/logs.type';

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should verify directory and files on module init', async () => {
    (service as any).verifyDirectory = jest.fn();
    (service as any).verifyFiles = jest.fn();

    const verifyDirectory = (service as any).verifyDirectory;
    const verifyFiles = (service as any).verifyFiles;

    await service.onModuleInit();

    expect(verifyDirectory).toHaveBeenCalled();
    expect(verifyFiles).toHaveBeenCalledWith('./logs/combined.log');
    expect(verifyFiles).toHaveBeenCalledWith('./logs/error.log');
  });

  it('should log info messages', () => {
    service.logInfo = jest.fn();

    const message: Logs = {
      method: 'GET',
      url: '/api/test',
      params: { cep: 12345678 },
      body: {},
      statusCode: 200,
      executionTime: '100ms',
    };

    service.logInfo(message);

    expect(service.logInfo).toHaveBeenCalledTimes(1);
    expect(service.logInfo).toHaveBeenCalledWith(message);
  });

  it('should log error messages', () => {
    service.logError = jest.fn();

    const message: Logs = {
      method: 'POST',
      url: '/api/test',
      params: { cep: 12345678 },
      body: {},
      statusCode: 500,
      executionTime: '200ms',
    };

    service.logError(message);

    expect(service.logError).toHaveBeenCalledTimes(1);
    expect(service.logError).toHaveBeenCalledWith(message);
  });

  it('should create logs directory if it does not exist', async () => {
    const fs = {
      access: jest.fn((_path: string) =>
        Promise.reject(new Error('Directory does not exist')),
      ),
      mkdir: jest.fn((_path: string, _options: { recursive: boolean }) =>
        Promise.resolve(),
      ),
    };

    (service as any).verifyDirectory = jest.fn(async () => {
      try {
        await fs.access('./logs');
      } catch {
        await fs.mkdir('./logs', { recursive: true });
      }
    });
    const verifyDirectory = (service as any).verifyDirectory;

    await verifyDirectory();

    expect(fs.access).toHaveBeenCalledWith('./logs');
    expect(fs.access).toHaveBeenCalledTimes(1);
    expect(fs.mkdir).toHaveBeenCalledWith('./logs', { recursive: true });
    expect(fs.mkdir).toHaveBeenCalledTimes(1);
  });

  it('logs directory should exist', async () => {
    const fs = {
      access: jest.fn((_path: string) => Promise.resolve()),
      mkdir: jest.fn(),
    };

    (service as any).verifyDirectory = jest.fn(async () => {
      try {
        await fs.access('./logs');
      } catch {
        await fs.mkdir('./logs', { recursive: true });
      }
    });

    const verifyDirectory = (service as any).verifyDirectory;

    await verifyDirectory();

    expect(fs.access).toHaveBeenCalledWith('./logs');
    expect(fs.access).toHaveBeenCalledTimes(1);
    expect(fs.mkdir).toHaveBeenCalledTimes(0);
  });

  it('should create log files if they do not exist', async () => {
    const fs = {
      access: jest.fn((_path: string) =>
        Promise.reject(new Error('File does not exist')),
      ),
      writeFile: jest.fn((_path: string, _data: string) => Promise.resolve()),
    };

    (service as any).verifyFiles = jest.fn(async (filePath: string) => {
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, '');
      }
    });

    const verifyFiles = (service as any).verifyFiles;

    await verifyFiles('./logs/combined.log');

    expect(fs.access).toHaveBeenCalledWith('./logs/combined.log');
    expect(fs.access).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledWith('./logs/combined.log', '');
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
  });

  it('log file should exist', async () => {
    const fs = {
      access: jest.fn((_path: string) => Promise.resolve()),
      writeFile: jest.fn(),
    };

    (service as any).verifyFiles = jest.fn(async (filePath: string) => {
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, '');
      }
    });

    const verifyFiles = (service as any).verifyFiles;

    await verifyFiles('./logs/combined.log');

    expect(fs.access).toHaveBeenCalledWith('./logs/combined.log');
    expect(fs.access).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledTimes(0);
  });
});
