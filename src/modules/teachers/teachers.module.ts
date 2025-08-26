import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TeachersSchema } from './schemas/teachers.schema';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

import { ModalitiesModule } from '@ds-modules/modalities/modalities.module';
import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { ServicesModule } from '@ds-services/services.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Teachers', schema: TeachersSchema }]),
    ModalitiesModule,
    ServicesModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService, ReduceImagePipe],
})
export class TeachersModule {}
