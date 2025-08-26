import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminSchema } from './schemas/admin.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { AuthModule } from '@ds-modules/auth/auth.module';
import { ServicesModule } from '@ds-services/services.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),
    AuthModule,
    ServicesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
