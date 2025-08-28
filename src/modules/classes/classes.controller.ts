import { Body, Controller, Post, UploadedFile } from '@nestjs/common';

import { ClassesService } from './classes.service';
import { ClassDto } from './dtos/class.dto';

import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { UploadImage } from '@ds-common/decorators/upload-image.decorator';
import { ApiResponse } from '@ds-types/api-response.type';
import { ClassDocument } from '@ds-types/documents/class-document.type';

@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly reduceImagePipe: ReduceImagePipe,
  ) {}

  @UploadImage()
  @Post()
  public async createClass(
    @UploadedFile() file: Express.Multer.File,
    @Body() classDto: ClassDto,
  ): Promise<ApiResponse<ClassDocument>> {
    const reducedImageBuffer = await this.reduceImagePipe.transform(file);

    const { startHour, endHour, minAge, maxAge, ...rest } = classDto;

    const newClass: ClassDocument = {
      ...rest,
      hour: {
        start: startHour,
        end: endHour,
      },
      age: {
        min: minAge,
        max: maxAge,
      },
      image: reducedImageBuffer,
    } as ClassDocument;

    const modality = await this.classesService.createClass(newClass);

    return {
      data: modality,
    };
  }
}
