import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

import { ClassesService } from './classes.service';
import { ClassDto } from './dtos/class.dto';

import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { UploadImage } from '@ds-common/decorators/upload-image.decorator';
import { ApiResponse } from '@ds-types/api-response.type';
import { ClassDocument } from '@ds-types/documents/class-document.type';
import { ImageBase64Interceptor } from '@ds-common/interceptors/image-base64/image-base64.interceptor';
import { RoleGuard } from '@ds-common/guards/role/role.guard';
import { Roles } from '@ds-common/decorators/roles.decorator';

@UseInterceptors(ImageBase64Interceptor)
@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly reduceImagePipe: ReduceImagePipe,
  ) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
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
