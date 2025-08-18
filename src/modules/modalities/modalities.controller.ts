import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ModalitiesService } from './modalities.service';
import { ModalityDto } from './dtos/modality.dto';

import { ApiResponse } from '@ds-types/api-response.type';
import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';
import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { ImageBase64Interceptor } from '@ds-common/interceptors/image-base64/image-base64.interceptor';

@Controller('modalities')
@UseInterceptors(ImageBase64Interceptor)
export class ModalitiesController {
  constructor(
    private readonly modalitiesService: ModalitiesService,
    private readonly reduceImagePipe: ReduceImagePipe,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
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
  )
  public async createModality(
    @Body() modalityDto: ModalityDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<ModalitiesDocument>> {
    const reducedImageBuffer = await this.reduceImagePipe.transform(file);

    const newModality = {
      ...modalityDto,
      image: reducedImageBuffer,
    } as ModalitiesDocument;

    const modality = await this.modalitiesService.createModality(newModality);

    return {
      data: modality.toObject(),
    };
  }
}
