import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VisitsSchema } from './schemas/visits.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Visits', schema: VisitsSchema }]),
  ],
})
export class VisitsModule {}
