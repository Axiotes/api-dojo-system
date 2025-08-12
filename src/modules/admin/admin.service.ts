import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AdminDto } from './dtos/admin.dto';
import { Admin } from './schemas/admin.schema';


@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>) {}

  public async createAdmin(adminDto: AdminDto): Promise<AdminDto> {}
}
