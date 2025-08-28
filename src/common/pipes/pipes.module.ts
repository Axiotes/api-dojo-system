import { Module } from '@nestjs/common';

import { ReduceImagePipe } from './reduce-image/reduce-image.pipe';

@Module({
  providers: [ReduceImagePipe],
  exports: [ReduceImagePipe],
})
export class PipesModule {}
