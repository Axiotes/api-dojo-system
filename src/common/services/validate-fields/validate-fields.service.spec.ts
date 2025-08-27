import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Types } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { ValidateFieldsService } from './validate-fields.service';

describe('ValidateFieldsService', () => {
  let service: ValidateFieldsService;
  let connection: Connection;

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
      ],
    }).compile();

    service = module.get<ValidateFieldsService>(ValidateFieldsService);
    connection = module.get<Connection>(getConnectionToken());

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
      new ConflictException(`Email test@email.com already exists`),
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
      new ConflictException(`CPF 12345678910 already exists`),
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
    expect(modelMock.findById).toHaveBeenCalledWith(document._id);
  });

  it('should throw NotFoundException if document is not found', async () => {
    const id = new Types.ObjectId('64f1b2a3c4d5e6f7890abc12');

    modelMock.findById.mockReturnThis();
    modelMock.lean.mockResolvedValue(null);

    await expect(service.isActive('User', id)).rejects.toThrow(
      new NotFoundException(`User with id ${id} not found`),
    );

    expect(connection.model).toHaveBeenCalledWith('User');
    expect(modelMock.findById).toHaveBeenCalledWith(id);
  });

  it('should throw BadRequestException if document is disable', async () => {
    const document = {
      _id: new Types.ObjectId('64f1b2a3c4d5e6f7890abc12'),
      status: false,
    };

    modelMock.findById.mockReturnThis();
    modelMock.lean.mockResolvedValue(document);

    await expect(service.isActive('User', document._id)).rejects.toThrow(
      new BadRequestException(`User with id ${document._id} is disabled`),
    );

    expect(connection.model).toHaveBeenCalledWith('User');
    expect(modelMock.findById).toHaveBeenCalledWith(document._id);
  });
});
