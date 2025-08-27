import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ClassesSchema } from './schemas/classes.schema';
import { ClassesHistorySchema } from './schemas/classes-history.schema';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

import { ServicesModule } from '@ds-services/services.module';
import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Classes', schema: ClassesSchema },
      { name: 'ClassesHistory', schema: ClassesHistorySchema },
    ]),
    ServicesModule,
  ],
  controllers: [ClassesController],
  providers: [ClassesService, ReduceImagePipe],
})
export class ClassesModule {}
