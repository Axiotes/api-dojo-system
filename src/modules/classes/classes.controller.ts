import { Body, Controller, Post } from '@nestjs/common';

import { ClassesService } from './classes.service';
import { ClassDto } from './dtos/class.dto';

import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';

@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly reduceImagePipe: ReduceImagePipe,
  ) {}

  @Post()
  public createClass(@Body() classDto: ClassDto) {
    return classDto;
  }
}
