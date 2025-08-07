import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ModalitiesSchema } from './schemas/modalities.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Modalities', schema: ModalitiesSchema },
    ]),
  ],
})
export class ModalitiesModule {}
