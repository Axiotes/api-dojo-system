import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AthletesSchema } from './schemas/athletes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Athletes', schema: AthletesSchema }]),
  ],
})
export class AthletesModule {}
