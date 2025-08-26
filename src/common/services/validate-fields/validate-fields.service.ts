import { ConflictException, Injectable } from '@nestjs/common';
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
}
