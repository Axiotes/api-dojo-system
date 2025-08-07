import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TeachersSchema } from './schemas/teachers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Plans', schema: TeachersSchema }]),
  ],
})
export class TeachersModule {}
