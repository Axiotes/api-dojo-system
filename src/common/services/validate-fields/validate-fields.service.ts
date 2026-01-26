import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { UserMessage } from '@ds-enums/user-message.enum';
import { ModuleName } from '@ds-enums/module-name.enum';
import { TranslateService } from '@ds-services/translate/translate.service';

@Injectable()
export class ValidateFieldsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly translateService: TranslateService,
  ) {}

  public async validateEmail(modelName: string, email: string): Promise<void> {
    const model = this.connection.model(modelName);

    const emailExists = await model.exists({ email });

    if (emailExists) {
      throw new ConflictException(
        this.translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.COMMON,
          message: UserMessage.EMAIL_EXISTS,
        }),
      );
    }
  }

  public async validateCpf(modelName: string, cpf: string): Promise<void> {
    const model = this.connection.model(modelName);

    const cpfExists = await model.exists({ cpf });

    if (cpfExists) {
      throw new ConflictException(
        this.translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.COMMON,
          message: UserMessage.CPF_EXISTS,
        }),
      );
    }
  }

  public async isActive(modelName: string, id: Types.ObjectId): Promise<void> {
    if (Object.values(ModuleName).includes(modelName as ModuleName)) {
      throw new Error('Invalid model name');
    }

    const model = this.connection.model(modelName);

    const document = await model
      .findById(id, { status: 1 })
      .lean<{ status: boolean }>();

    if (!document) {
      throw new NotFoundException(
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.COMMON,
            message: UserMessage.NOT_FOUND,
          },
          {
            args: {
              moduleName: this.translateService.translate({
                i18nFile: I18nFiles.ERRORS,
                module: modelName.toUpperCase() as ModuleName,
                message: UserMessage.MODULE_NAME,
              }),
            },
          },
        ),
      );
    }

    if (!document.status) {
      throw new ConflictException(
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.COMMON,
            message: UserMessage.IS_DISABLED,
          },
          {
            args: {
              moduleName: this.translateService.translate({
                i18nFile: I18nFiles.ERRORS,
                module: modelName.toUpperCase() as ModuleName,
                message: UserMessage.MODULE_NAME,
              }),
            },
          },
        ),
      );
    }
  }
}
