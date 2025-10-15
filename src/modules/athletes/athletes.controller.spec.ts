import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Request } from 'express';

import { AthletesController } from './athletes.controller';
import { AthletesService } from './athletes.service';
import { AthleteDto } from './dtos/athlete.dto';

import { PaymentMode } from '@ds-enums/payment-mode.enum';
import { AthleteDocument } from '@ds-types/documents/athlete-document.type';
import { PaymentPix } from '@ds-types/payment-pix.type';

describe('AthletesController', () => {
  let controller: AthletesController;
  let service: AthletesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AthletesController],
      providers: [
        {
          provide: AthletesService,
          useValue: {
            createAthlete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AthletesController>(AthletesController);
    service = module.get<AthletesService>(AthletesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an athlete successfully by admin', async () => {
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: 'admin' },
    };
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      birthDate: new Date('1978-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      email: 'unit.test.dj@gmail.com',
      paymentMode: PaymentMode.PERSONALLY,
    };
    const athlete = {
      _id: new Types.ObjectId(),
      name: athleteDto.name,
      cpf: athleteDto.cpf,
      birthDate: athleteDto.birthDate,
      plan: athleteDto.plan,
      responsibles: [],
    } as AthleteDocument;

    service.createAthlete = jest.fn().mockResolvedValue(athlete);

    const result = await controller.createAthlete(
      athleteDto,
      mockReq as Request,
    );

    expect(result).toEqual({ data: athlete });
    expect(service.createAthlete).toHaveBeenCalledWith(
      athleteDto,
      mockReq.user.role,
    );
  });

  it('should create an athlete successfully by user', async () => {
    const mockReq: Partial<Request> & { user?: { role?: string } } = {
      user: { role: undefined },
    };
    const athleteDto: AthleteDto = {
      name: 'Test',
      cpf: '42153505240',
      birthDate: new Date('1978-04-22'),
      plan: new Types.ObjectId('68ab8644201ea1a63f8cb22e'),
      classes: new Types.ObjectId('68b4acbe14a396b9de66a803'),
      email: 'unit.test.dj@gmail.com',
      paymentMode: PaymentMode.PIX,
    };
    const athlete = {
      id: new Types.ObjectId(),
      name: athleteDto.name,
      cpf: athleteDto.cpf,
      birthDate: athleteDto.birthDate,
      plan: athleteDto.plan,
      responsibles: [],
    } as AthleteDocument;
    const payment: PaymentPix = {
      athlete: athlete.id,
      date: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      methodId: 'pix',
      mode: PaymentMode.PIX,
      paymentIdMP: '1',
      plan: athleteDto.plan,
      qrCode: 'qrCode',
      qrCodeBase64: 'data:image/png;base64,qrCode',
      status: 'Pending',
    };

    service.createAthlete = jest.fn().mockResolvedValue({ athlete, payment });

    const result = await controller.createAthlete(
      athleteDto,
      mockReq as Request,
    );

    expect(result).toEqual({ data: { athlete, payment } });
    expect(service.createAthlete).toHaveBeenCalledWith(
      athleteDto,
      mockReq.user.role,
    );
  });
});
