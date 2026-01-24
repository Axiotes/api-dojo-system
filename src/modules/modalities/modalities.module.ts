import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ModalitiesSchema } from './schemas/modalities.schema';
import { ModalitiesController } from './modalities.controller';
import { ModalitiesService } from './modalities.service';

import { PipesModule } from '@ds-common/pipes/pipes.module';
import { PlansModule } from '@ds-modules/plans/plans.module';
import { TeachersModule } from '@ds-modules/teachers/teachers.module';
import { ClassesModule } from '@ds-modules/classes/classes.module';
import { ServicesModule } from '@ds-services/services.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Modalities', schema: ModalitiesSchema },
    ]),
    PipesModule,
    PlansModule,
    ServicesModule,
    forwardRef(() => TeachersModule),
    forwardRef(() => ClassesModule),
  ],
  controllers: [ModalitiesController],
  providers: [ModalitiesService],
  exports: [ModalitiesService],
})
export class ModalitiesModule {}
