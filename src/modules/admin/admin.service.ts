import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AdminDto } from './dtos/admin.dto';
import { Admin } from './schemas/admin.schema';

import { AdminDocument } from '@ds-types/documents/admin';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>) {}

  public async createAdmin(adminDto: AdminDto): Promise<AdminDocument> {
    const admin = await this.adminModel
      .findOne({ email: adminDto.email })
      .exec();

    if (admin) {
      throw new ConflictException('An admin with this email already exists');
    }

    return await this.adminModel.create(adminDto);
  }

  public async findById(id: string): Promise<AdminDocument> {
    const admin = await this.adminModel.findById(id).exec();

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }
}
