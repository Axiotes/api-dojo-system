import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

import { CombinedLogsInterceptor } from './combined-logs.interceptor';

import { LoggerService } from '@ds-services/logger/logger.service';

describe('CombinedLogsInterceptor', () => {
  let interceptor: CombinedLogsInterceptor;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(() => {
    const partialLogger: Partial<jest.Mocked<LoggerService>> = {
      logInfo: jest.fn(),
      logError: jest.fn(),
    };
    loggerService = partialLogger as jest.Mocked<LoggerService>;
    interceptor = new CombinedLogsInterceptor(loggerService);
  });

  const mockContext: ExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
        url: '/test',
        params: {},
        body: {},
      }),
      getResponse: () => ({
        statusCode: 500,
      }),
    }),
  } as Partial<ExecutionContext> as ExecutionContext;

  it('should be defined', () => {
    expect(new CombinedLogsInterceptor(loggerService)).toBeDefined();
  });

  it('should log request info with execution time', (done) => {
    const callHandler: CallHandler = {
      handle: () => of('response'),
    };

    interceptor.intercept(mockContext, callHandler).subscribe((response) => {
      expect(response).toEqual('response');
      done();
    });
  });
});
