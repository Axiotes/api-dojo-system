import { Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ReduceImagePipe implements PipeTransform {
  async transform(file: Express.Multer.File): Promise<Buffer> {
    const targetSize = 500 * 1024;
    let quality = 80;
    let buffer = await sharp(file.buffer).jpeg({ quality }).toBuffer();

    while (buffer.length > targetSize && quality > 10) {
      quality -= 10;
      buffer = await sharp(file.buffer).jpeg({ quality }).toBuffer();
    }

    return buffer;
  }
}
