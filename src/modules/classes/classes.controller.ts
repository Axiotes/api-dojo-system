import { Controller } from '@nestjs/common';

import { ClassesService } from './classes.service';

import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';

@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly reduceImagePipe: ReduceImagePipe,
  ) {}
}
