import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class ValidateFieldsService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  public async validateEmail(modelName: string, email: string): Promise<void> {
    const model = this.connection.model(modelName);

    const emailExists = await model.exists({ email });

    if (emailExists) {
      throw new ConflictException(`Email ${email} already exists`);
    }
  }

  public async validateCpf(modelName: string, cpf: string): Promise<void> {
    const model = this.connection.model(modelName);

    const cpfExists = await model.exists({ cpf });

    if (cpfExists) {
      throw new ConflictException(`CPF ${cpf} already exists`);
    }
  }

  public async isActive(modelName: string, id: string): Promise<void> {
    const model = this.connection.model(modelName);

    const document = await model.findById(id).lean<{ status: boolean }>();

    if (!document) {
      throw new NotFoundException(`${modelName} with id ${id} not found`);
    }

    if (!document.status) {
      throw new BadRequestException(`${modelName} with id ${id} is disabled`);
    }
  }
}
