import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ClassesSchema } from './schemas/classes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Classes', schema: ClassesSchema }]),
  ],
})
export class ClassesModule {}
