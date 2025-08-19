import { Test, TestingModule } from '@nestjs/testing';

import { ModalitiesController } from './modalities.controller';
import { ModalitiesService } from './modalities.service';
import { ModalityDto } from './dtos/modality.dto';

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
      toObject: jest.fn().mockReturnValue({
        _id: '60c72b2f9b1d8c001c8e4e1a',
        ...dto,
        image: 'base64-image',
      }),
    } as unknown as ModalitiesDocument;

    reduceImagePipe.transform.mockResolvedValue(reducedImage);
    modalitiesService.createModality.mockResolvedValue(mockModality);

    const result = await controller.createModality(dto, mockFile);

    expect(result).toEqual({
      data: mockModality.toObject(),
    });
    expect(reduceImagePipe.transform).toHaveBeenCalledWith(mockFile);
    expect(modalitiesService.createModality).toHaveBeenCalledWith({
      ...dto,
      image: reducedImage,
    });
  });
});
