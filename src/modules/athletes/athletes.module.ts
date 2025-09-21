import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AthletesSchema } from './schemas/athletes.schema';
import { AthletesController } from './athletes.controller';
import { AthletesService } from './athletes.service';

import { ServicesModule } from '@ds-services/services.module';
import { PaymentModule } from '@ds-modules/payment/payment.module';
import { PlansModule } from '@ds-modules/plans/plans.module';
import { ClassesModule } from '@ds-modules/classes/classes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Athletes', schema: AthletesSchema }]),
    ServicesModule,
    PaymentModule,
    PlansModule,
    ClassesModule,
  ],
  controllers: [AthletesController],
  providers: [AthletesService],
})
export class AthletesModule {}
