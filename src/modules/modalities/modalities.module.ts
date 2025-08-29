import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ModalitiesSchema } from './schemas/modalities.schema';
import { ModalitiesController } from './modalities.controller';
import { ModalitiesService } from './modalities.service';

import { PipesModule } from '@ds-common/pipes/pipes.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Modalities', schema: ModalitiesSchema },
    ]),
    PipesModule,
  ],
  controllers: [ModalitiesController],
  providers: [ModalitiesService],
  exports: [ModalitiesService],
})
export class ModalitiesModule {}
