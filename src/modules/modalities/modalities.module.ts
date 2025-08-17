import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ModalitiesSchema } from './schemas/modalities.schema';
import { ModalitiesController } from './modalities.controller';
import { ModalitiesService } from './modalities.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Modalities', schema: ModalitiesSchema },
    ]),
  ],
  controllers: [ModalitiesController],
  providers: [ModalitiesService],
})
export class ModalitiesModule {}
