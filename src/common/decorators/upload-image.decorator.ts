import {
  applyDecorators,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

export function UploadImage(): MethodDecorator {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor('image', {
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            return cb(
              new BadRequestException(
                'Only images (jpg, jpeg, png, gif) are allowed',
              ),
              false,
            );
          }

          cb(null, true);
        },
      }),
    ),
  );
}
