import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ClassesSchema } from './schemas/classes.schema';
import { ClassesHistorySchema } from './schemas/classes-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Classes', schema: ClassesSchema },
      { name: 'ClassesHistory', schema: ClassesHistorySchema },
    ]),
  ],
})
export class ClassesModule {}
