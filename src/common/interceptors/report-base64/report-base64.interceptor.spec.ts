import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

import { ReportBase64Interceptor } from './report-base64.interceptor';

import { ApiResponse } from '@ds-types/api-response.type';
import { Report } from '@ds-types/report.type';

describe('ReportBase64Interceptor', () => {
  let interceptor: ReportBase64Interceptor;

  beforeEach(() => {
    interceptor = new ReportBase64Interceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform file to base64', (done) => {
    const buffer = Buffer.from('test file content');
    const mockResponse: ApiResponse<Report> = {
      data: {
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        file: buffer,
      },
    };

    const callHandler: CallHandler = {
      handle: jest.fn().mockReturnValue(of(mockResponse)),
    };

    const context: ExecutionContext = {} as ExecutionContext;

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result.data.file).toBe(
        `data:application/pdf;base64,${buffer.toString('base64')}`,
      );
      expect(result.data.mimeType).toBe('application/pdf');
      expect(callHandler.handle).toHaveBeenCalled();
      done();
    });
  });

  it('should work with empty buffer', (done) => {
    const buffer = Buffer.from('');
    const mockResponse: ApiResponse<Report> = {
      data: {
        filename: 'empty.txt',
        mimeType: 'text/plain',
        file: buffer,
      },
    };

    const callHandler: CallHandler = {
      handle: jest.fn().mockReturnValue(of(mockResponse)),
    };

    const context: ExecutionContext = {} as ExecutionContext;

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result.data.file).toBe(
        `data:text/plain;base64,${buffer.toString('base64')}`,
      );
      done();
    });
  });
});
