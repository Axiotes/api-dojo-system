import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PlansSchema } from './schemas/plans.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Plans', schema: PlansSchema }]),
  ],
})
export class PlansModule {}
