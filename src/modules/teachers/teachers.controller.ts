import { Body, Controller, Post, UploadedFile } from '@nestjs/common';

import { TeachersService } from './teachers.service';
import { TeacherDto } from './dtos/teacher.dto';

import { UploadImage } from '@ds-common/decorators/upload-image.decorator';
import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { TeacherDocument } from '@ds-types/documents/teacher-document.type';

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
  ) {
    const reducedImageBuffer = await this.reduceImagePipe.transform(file);

    const newTeacher = {
      ...teacherDto,
      image: reducedImageBuffer,
    } as TeacherDocument;
  }
}
