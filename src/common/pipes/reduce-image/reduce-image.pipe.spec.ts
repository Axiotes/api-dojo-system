import * as sharp from 'sharp';

import { ReduceImagePipe } from './reduce-image.pipe';

describe('ReduceImagePipe', () => {
  let pipe: ReduceImagePipe;

  beforeEach(() => {
    pipe = new ReduceImagePipe();

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should reduce image to be smaller than 500kb', async () => {
    const buffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .jpeg()
      .toBuffer();

    const file = {
      buffer,
    } as Express.Multer.File;

    const result = await pipe.transform(file);

    expect(result.length).toBeLessThan(500 * 1024);
  });

  it('should not reduce image if already smaller than 500KB', async () => {
    const buffer = await sharp({
      create: {
        width: 200,
        height: 150,
        channels: 3,
        background: { r: 0, g: 255, b: 0 },
      },
    })
      .jpeg({ quality: 80 })
      .toBuffer();

    const file = { buffer } as Express.Multer.File;

    const result = await pipe.transform(file);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(500 * 1024);
    expect(result.length).toBe(buffer.length);
  });
});
