import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ClassesSchema } from './schemas/classes.schema';
import { ClassesHistorySchema } from './schemas/classes-history.schema';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

import { ServicesModule } from '@ds-services/services.module';
import { ModalitiesModule } from '@ds-modules/modalities/modalities.module';
import { TeachersModule } from '@ds-modules/teachers/teachers.module';
import { PipesModule } from '@ds-common/pipes/pipes.module';
import { PlansModule } from '@ds-modules/plans/plans.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Classes', schema: ClassesSchema },
      { name: 'ClassesHistory', schema: ClassesHistorySchema },
    ]),
    ServicesModule,
    PlansModule,
    PipesModule,
    forwardRef(() => TeachersModule),
    forwardRef(() => ModalitiesModule),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
