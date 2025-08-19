import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';

import { ImageBase64Interceptor } from './image-base64.interceptor';

describe('ImageBase64Interceptor', () => {
  let interceptor: ImageBase64Interceptor;
  let mockNext: Partial<CallHandler>;

  beforeEach(() => {
    interceptor = new ImageBase64Interceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should convert a single image buffer to base64', async () => {
    const buffer = Buffer.from('test-image');
    const data = {
      data: { image: buffer },
    };

    mockNext = {
      handle: jest.fn(() => of(data)),
    };

    const result = (await lastValueFrom(
      interceptor.intercept({} as ExecutionContext, mockNext as CallHandler),
    )) as { data: { image: string } };

    expect(result.data.image).toContain(buffer.toString('base64'));
  });

  it('should convert multiple image buffers in an array to base64', async () => {
    const buffer1 = Buffer.from('image-1');
    const buffer2 = Buffer.from('image-2');
    const data = { data: [{ image: buffer1 }, { image: buffer2 }] };

    mockNext = {
      handle: jest.fn(() => of(data)),
    };

    const result = (await lastValueFrom(
      interceptor.intercept({} as ExecutionContext, mockNext as CallHandler),
    )) as { data: { image: string }[] };
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data[0].image).toContain(buffer1.toString('base64'));
    expect(result.data[1].image).toContain(buffer2.toString('base64'));
  });
});
