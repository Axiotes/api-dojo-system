import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PlansSchema } from './schemas/plans.schema';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';

import { ModalitiesModule } from '@ds-modules/modalities/modalities.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Plans', schema: PlansSchema }]),
    ModalitiesModule,
  ],
  providers: [PlansService],
  controllers: [PlansController],
})
export class PlansModule {}
