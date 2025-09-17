import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TeachersSchema } from './schemas/teachers.schema';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

import { ModalitiesModule } from '@ds-modules/modalities/modalities.module';
import { ServicesModule } from '@ds-services/services.module';
import { PipesModule } from '@ds-common/pipes/pipes.module';
import { ClassesModule } from '@ds-modules/classes/classes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Teachers', schema: TeachersSchema }]),
    ServicesModule,
    PipesModule,
    forwardRef(() => ClassesModule),
    forwardRef(() => ModalitiesModule),
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
