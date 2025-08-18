import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ModalitiesSchema } from './schemas/modalities.schema';
import { ModalitiesController } from './modalities.controller';
import { ModalitiesService } from './modalities.service';

import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Modalities', schema: ModalitiesSchema },
    ]),
  ],
  controllers: [ModalitiesController],
  providers: [ModalitiesService, ReduceImagePipe],
})
export class ModalitiesModule {}
