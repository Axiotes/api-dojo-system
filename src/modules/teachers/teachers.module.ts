import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TeachersSchema } from './schemas/teachers.schema';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

import { ModalitiesModule } from '@ds-modules/modalities/modalities.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Teachers', schema: TeachersSchema }]),
    ModalitiesModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
