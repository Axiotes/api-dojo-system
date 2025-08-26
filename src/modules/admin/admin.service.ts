import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { AdminDto } from './dtos/admin.dto';
import { Admin } from './schemas/admin.schema';
import { AdminLoginDto } from './dtos/admin-login.dto';
import { FindAdminDto } from './dtos/find-admin.dto';
import { UpdateAdminDto } from './dtos/update-admin.dto';

import { AdminDocument } from '@ds-types/documents/admin';
import { ValidateFieldsService } from '@ds-services/validate-fields/validate-fields.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    private jwtService: JwtService,
    private readonly validadeFieldsService: ValidateFieldsService,
  ) {}

  public async createAdmin(adminDto: AdminDto): Promise<AdminDocument> {
    await this.validadeFieldsService.validateEmail('Admin', adminDto.email);

    return await this.adminModel.create(adminDto);
  }

  public async findById(id: string): Promise<AdminDocument> {
    const admin = await this.adminModel.findById(id).exec();

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  public async findAll(queryParams: FindAdminDto): Promise<AdminDocument[]> {
    const query = this.adminModel
      .find()
      .skip(queryParams.skip)
      .limit(queryParams.limit);

    if (queryParams.status !== undefined) {
      query.where('status').equals(queryParams.status);
    }

    return await query.exec();
  }

  public async login(loginDto: AdminLoginDto): Promise<string> {
    const admin = await this.verifyAdmin(loginDto);
    const token = this.jwtService.sign({ id: admin._id, role: 'admin' });

    return token;
  }

  public async setStatus(id: string, status: boolean): Promise<void> {
    const admin = await this.adminModel.findById(id).exec();

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    admin.status = status;
    await admin.save();
  }

  public async updateAdmin(updateDto: UpdateAdminDto): Promise<AdminDocument> {
    const admin = await this.verifyAdmin({
      email: updateDto.email,
      password: updateDto.password,
    });

    if (updateDto.newEmail && updateDto.newEmail !== admin.email) {
      const emailExists = await this.adminModel
        .findOne({ email: updateDto.newEmail })
        .exec();

      if (emailExists) {
        throw new ConflictException('An admin with this email already exists');
      }
    }

    const adminUpdates = {
      name: updateDto.newName || admin.name,
      email: updateDto.newEmail || admin.email,
      password: updateDto.newPassword
        ? bcrypt.hashSync(updateDto.newPassword, 10)
        : admin.password,
    };

    const updatedAdmin = await this.adminModel
      .findByIdAndUpdate(admin._id, adminUpdates, { new: true })
      .exec();

    return updatedAdmin;
  }

  private async verifyAdmin(loginDto: AdminLoginDto): Promise<AdminDocument> {
    const admin = await this.adminModel
      .findOne({ email: loginDto.email, status: true })
      .select('+password')
      .exec();

    if (!admin) {
      throw new NotFoundException('Invalid email or password');
    }

    const passwordMatch = bcrypt.compareSync(loginDto.password, admin.password);

    if (!passwordMatch) {
      throw new NotFoundException('Invalid email or password');
    }

    return admin;
  }
}
