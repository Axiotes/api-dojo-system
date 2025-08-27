import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PlansSchema } from './schemas/plans.schema';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';

import { ServicesModule } from '@ds-services/services.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Plans', schema: PlansSchema }]),
    ServicesModule,
  ],
  providers: [PlansService],
  controllers: [PlansController],
})
export class PlansModule {}
