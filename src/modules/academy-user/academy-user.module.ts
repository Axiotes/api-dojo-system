import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AcademyUserSchema } from './schemas/academy-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AcademyUser', schema: AcademyUserSchema },
    ]),
  ],
})
export class AcademyUserModule {}
