import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServicesModule } from './common/services/services.module';
import { ModalitiesModule } from './modules/modalities/modalities.module';
import { PlansModule } from './modules/plans/plans.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { AthletesModule } from './modules/athletes/athletes.module';
import { ClassesModule } from './modules/classes/classes.module';
import { VisitsModule } from './modules/visits/visits.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AuthModule } from './modules/auth/auth.module';

import { AdminModule } from '@ds-modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),

    ServicesModule,

    AdminModule,

    ModalitiesModule,

    PlansModule,

    TeachersModule,

    AthletesModule,

    ClassesModule,

    VisitsModule,

    PaymentModule,

    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
