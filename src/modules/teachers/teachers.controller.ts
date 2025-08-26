import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { TeachersService } from './teachers.service';
import { TeacherDto } from './dtos/teacher.dto';

import { UploadImage } from '@ds-common/decorators/upload-image.decorator';
import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { TeacherDocument } from '@ds-types/documents/teacher-document.type';
import { ImageBase64Interceptor } from '@ds-common/interceptors/image-base64/image-base64.interceptor';
import { ApiResponse } from '@ds-types/api-response.type';

@UseInterceptors(ImageBase64Interceptor)
@Controller('teachers')
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
    private readonly reduceImagePipe: ReduceImagePipe,
  ) {}

  @UploadImage()
  @Post()
  public async createTeacher(
    @UploadedFile() file: Express.Multer.File,
    @Body() teacherDto: TeacherDto,
  ): Promise<ApiResponse<TeacherDocument>> {
    const reducedImageBuffer = await this.reduceImagePipe.transform(file);

    const newTeacher = {
      ...teacherDto,
      image: reducedImageBuffer,
    } as TeacherDocument;

    const teacher = await this.teachersService.createTeacher(newTeacher);

    return {
      data: teacher,
    };
  }
}
