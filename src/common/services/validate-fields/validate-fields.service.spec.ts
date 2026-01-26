import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Types } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { ValidateFieldsService } from './validate-fields.service';

import { TranslateService } from '@ds-services/translate/translate.service';
import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { ModuleName } from '@ds-enums/module-name.enum';
import { UserMessage } from '@ds-enums/user-message.enum';

describe('ValidateFieldsService', () => {
  let service: ValidateFieldsService;
  let connection: Connection;
  let translateService: TranslateService;

  const modelMock = {
    exists: jest.fn(),
    findById: jest.fn().mockReturnThis(),
    lean: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateFieldsService,
        {
          provide: getConnectionToken(),
          useValue: {
            model: jest.fn().mockReturnValue(modelMock),
          },
        },
        {
          provide: TranslateService,
          useValue: {
            translate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ValidateFieldsService>(ValidateFieldsService);
    connection = module.get<Connection>(getConnectionToken());
    translateService = module.get<TranslateService>(TranslateService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should not throw exception if email does not exist', async () => {
    modelMock.exists.mockResolvedValueOnce(null);

    await expect(
      service.validateEmail('User', 'test@email.com'),
    ).resolves.toBeUndefined();

    expect(connection.model).toHaveBeenCalledWith('User');
    expect(modelMock.exists).toHaveBeenCalledWith({ email: 'test@email.com' });
  });

  it('should throw ConflictException if email already exists', async () => {
    modelMock.exists.mockResolvedValueOnce(true);

    await expect(
      service.validateEmail('User', 'test@email.com'),
    ).rejects.toThrow(
      new ConflictException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.COMMON,
          message: UserMessage.EMAIL_EXISTS,
        }),
      ),
    );

    expect(connection.model).toHaveBeenCalledWith('User');
    expect(modelMock.exists).toHaveBeenCalledWith({ email: 'test@email.com' });
  });

  it('should not throw exception if cpf does not exist', async () => {
    modelMock.exists.mockResolvedValueOnce(null);

    await expect(
      service.validateCpf('User', '12345678910'),
    ).resolves.toBeUndefined();

    expect(connection.model).toHaveBeenCalledWith('User');
    expect(modelMock.exists).toHaveBeenCalledWith({ cpf: '12345678910' });
  });

  it('should throw ConflictException if cpf already exists', async () => {
    modelMock.exists.mockResolvedValueOnce(true);

    await expect(service.validateCpf('User', '12345678910')).rejects.toThrow(
      new ConflictException(
        translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.COMMON,
          message: UserMessage.CPF_EXISTS,
        }),
      ),
    );

    expect(connection.model).toHaveBeenCalledWith('User');
    expect(modelMock.exists).toHaveBeenCalledWith({ cpf: '12345678910' });
  });

  it('should not throw exception if document is active', async () => {
    const document = {
      _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
      status: true,
    };

    modelMock.findById.mockReturnThis();
    modelMock.lean.mockResolvedValue(document);

    await expect(
      service.isActive('User', document._id),
    ).resolves.toBeUndefined();

    expect(connection.model).toHaveBeenCalledWith('User');
    expect(modelMock.findById).toHaveBeenCalledWith(document._id, {
      status: 1,
    });
  });

  it('should throw NotFoundException if document is not found', async () => {
    const id = new Types.ObjectId('64f1b2a3c4d5e6f7890abc12');
    const modelName = 'Classes';

    modelMock.findById.mockReturnThis();
    modelMock.lean.mockResolvedValue(null);

    await expect(service.isActive(modelName, id)).rejects.toThrow(
      new NotFoundException(
        translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.COMMON,
            message: UserMessage.NOT_FOUND,
          },
          {
            args: {
              moduleName: translateService.translate({
                i18nFile: I18nFiles.ERRORS,
                module: modelName.toUpperCase() as ModuleName,
                message: UserMessage.MODULE_NAME,
              }),
            },
          },
        ),
      ),
    );

    expect(connection.model).toHaveBeenCalledWith(modelName);
    expect(modelMock.findById).toHaveBeenCalledWith(id, { status: 1 });
  });

  it('should throw ConflictException if document is disable', async () => {
    const document = {
      _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
      status: false,
    };
    const modelName = 'Classes';

    modelMock.findById.mockReturnThis();
    modelMock.lean.mockResolvedValue(document);

    await expect(service.isActive(modelName, document._id)).rejects.toThrow(
      new ConflictException(
        translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.COMMON,
            message: UserMessage.IS_DISABLED,
          },
          {
            args: {
              moduleName: translateService.translate({
                i18nFile: I18nFiles.ERRORS,
                module: modelName.toUpperCase() as ModuleName,
                message: UserMessage.MODULE_NAME,
              }),
            },
          },
        ),
      ),
    );

    expect(connection.model).toHaveBeenCalledWith(modelName);
    expect(modelMock.findById).toHaveBeenCalledWith(document._id, {
      status: 1,
    });
  });
});
