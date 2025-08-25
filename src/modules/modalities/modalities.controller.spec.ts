import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { ModalitiesController } from './modalities.controller';
import { ModalitiesService } from './modalities.service';
import { ModalityDto } from './dtos/modality.dto';
import { FindModalitiesDto } from './dtos/find-modalities.dto';
import { UpdateModalityDto } from './dtos/update-modality.dto';

import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';

describe('ModalitiesController', () => {
  let controller: ModalitiesController;
  let modalitiesService: jest.Mocked<ModalitiesService>;
  let reduceImagePipe: jest.Mocked<ReduceImagePipe>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModalitiesController],
      providers: [
        {
          provide: ModalitiesService,
          useValue: {
            createModality: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ReduceImagePipe,
          useValue: {
            transform: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ModalitiesController>(ModalitiesController);
    modalitiesService =
      module.get<jest.Mocked<ModalitiesService>>(ModalitiesService);
    reduceImagePipe = module.get<jest.Mocked<ReduceImagePipe>>(ReduceImagePipe);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a modality succesfully', async () => {
    const dto: ModalityDto = {
      name: 'Tests',
      description: 'Unit tests with jest',
    };
    const mockFile = {
      buffer: Buffer.from('fake-image'),
      mimetype: 'image/png',
    } as Express.Multer.File;
    const reducedImage = Buffer.from('reduced-image');
    const mockModality = {
      ...dto,
      image: reducedImage,
    } as unknown as ModalitiesDocument;

    reduceImagePipe.transform.mockResolvedValue(reducedImage);
    modalitiesService.createModality.mockResolvedValue(mockModality);

    const result = await controller.createModality(dto, mockFile);

    expect(result).toEqual({
      data: mockModality,
    });
    expect(reduceImagePipe.transform).toHaveBeenCalledWith(mockFile);
    expect(modalitiesService.createModality).toHaveBeenCalledWith({
      ...dto,
      image: reducedImage,
    });
  });

  it('should find a modality by ID successfully', async () => {
    const id = '60c72b2f9b1d8c001c8e4e1a';
    const modality: Partial<ModalitiesDocument> = {
      _id: id,
      name: 'Unit Test',
      description: 'Unit tests with jest',
    };

    modalitiesService.findById = jest.fn().mockResolvedValue(modality);

    const result = await controller.findById(id);

    expect(result).toEqual({ data: modality });
    expect(modalitiesService.findById).toHaveBeenCalledWith(id);
  });

  it('should throw BadRequestException for invalid ID format in findByID', async () => {
    const invalidId = '1234';

    await expect(controller.findById(invalidId)).rejects.toThrow(
      new BadRequestException('Invalid id format'),
    );
    expect(modalitiesService.findById).toHaveBeenCalledTimes(0);
  });

  it('should find all modalities successfully', async () => {
    const queryParams: FindModalitiesDto = { skip: 0, limit: 5, status: true };
    const modalities: Partial<ModalitiesDocument>[] = [
      {
        _id: '1',
        name: 'Test 1',
        description: 'Unit tests 1',
        image: Buffer.from('fake-image'),
      },
      {
        _id: '2',
        name: 'Test 2',
        description: 'Unit tests 2',
        image: Buffer.from('fake-image'),
      },
      {
        _id: '3',
        name: 'Test 3',
        description: 'Unit tests 3',
        image: Buffer.from('fake-image'),
      },
      {
        _id: '4',
        name: 'Test 4',
        description: 'Unit tests 4',
        image: Buffer.from('fake-image'),
      },
      {
        _id: '5',
        name: 'Test 5',
        description: 'Unit tests 5',
        image: Buffer.from('fake-image'),
      },
    ];

    modalitiesService.findAll = jest.fn().mockResolvedValue(modalities);

    const result = await controller.findAll(queryParams);

    expect(result).toEqual({
      data: modalities,
      pagination: { skip: queryParams.skip, limit: queryParams.limit },
      total: modalities.length,
    });
    expect(result.data.length).toBe(modalities.length);
    expect(modalitiesService.findAll).toHaveBeenCalledWith(queryParams);
  });

  it('should update a modality succesfully', async () => {
    const id: string = '60c72b2f9b1d8c001c8e4e1a';
    const mockFile = {
      buffer: Buffer.from('fake-image'),
      mimetype: 'image/png',
    } as Express.Multer.File;
    const reducedImage = Buffer.from('reduced-image');
    const updateDto: UpdateModalityDto = {
      name: 'Modality Name',
      description: 'Unit tests with jest',
    };
    const updatedModality = {
      _id: id,
      ...updateDto,
      image: reducedImage,
      status: true,
    } as ModalitiesDocument;

    reduceImagePipe.transform.mockResolvedValue(reducedImage);
    modalitiesService.update.mockResolvedValue(updatedModality);

    const result = await controller.update(id, mockFile, updateDto);

    expect(result).toEqual({ data: updatedModality });
    expect(reduceImagePipe.transform).toHaveBeenCalledWith(mockFile);
    expect(modalitiesService.update).toHaveBeenCalledWith({
      _id: id,
      ...updateDto,
      image: reducedImage,
    });
  });

  it('should update a modality succesfully without image file', async () => {
    const id: string = '60c72b2f9b1d8c001c8e4e1a';
    const updateDto: UpdateModalityDto = {
      name: 'Modality Name',
      description: 'Unit tests with jest',
    };
    const updatedModality = {
      _id: id,
      ...updateDto,
      status: true,
    } as ModalitiesDocument;

    modalitiesService.update.mockResolvedValue(updatedModality);

    const result = await controller.update(id, undefined, updateDto);

    expect(result).toEqual({ data: updatedModality });
    expect(reduceImagePipe.transform).toHaveBeenCalledTimes(0);
    expect(modalitiesService.update).toHaveBeenCalledWith({
      _id: id,
      ...updateDto,
    });
  });

  it('should throw BadRequestException for invalid ID format in update', async () => {
    const invalidId = '1234';

    await expect(controller.update(invalidId)).rejects.toThrow(
      new BadRequestException('Invalid id format'),
    );
    expect(reduceImagePipe.transform).toHaveBeenCalledTimes(0);
    expect(modalitiesService.update).toHaveBeenCalledTimes(0);
  });
});
