import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AthletesSchema } from './schemas/athletes.schema';
import { AthletesController } from './athletes.controller';
import { AthletesService } from './athletes.service';

import { ServicesModule } from '@ds-services/services.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Athletes', schema: AthletesSchema }]),
    ServicesModule,
  ],
  controllers: [AthletesController],
  providers: [AthletesService],
})
export class AthletesModule {}
