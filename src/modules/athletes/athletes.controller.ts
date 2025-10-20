import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation } from '@nestjs/swagger';

import { AthletesService } from './athletes.service';
import { AthleteDto } from './dtos/athlete.dto';

import { OptionalJwtGuard } from '@ds-common/guards/optional-jwt/optional-jwt.guard';
import { ApiResponse } from '@ds-types/api-response.type';
import { AthleteDocument } from '@ds-types/documents/athlete-document.type';
import { PaymentDocument } from '@ds-types/documents/payment-document.type';
import { PaymentPix } from '@ds-types/payment-pix.type';

@Controller('athletes')
export class AthletesController {
  constructor(private readonly athletesService: AthletesService) {}

  @ApiOperation({
    summary: 'Cadastra um novo atleta',
    description: `Qualquer usuário pode realizar essa ação.
    No entanto, quando é realizada por um administrador, significa que o cadastro 
    está sendo feito presencialmente na academia e que o pagamento também foi realizado presencialmente.
    Nesse caso, um e-mail é enviado ao novo atleta para que ele cadastre sua senha de acesso ao portal.
    Caso a ação seja realizada por um usuário comum, 
    o pagamento deve ser feito no momento da inscrição, por cartão ou pix`,
  })
  @UseGuards(OptionalJwtGuard)
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @Post()
  public async createAthlete(
    @Body() athleteDto: AthleteDto,
    @Req() req: Request,
  ): Promise<
    ApiResponse<{
      athlete: AthleteDocument;
      payment?: PaymentDocument | PaymentPix;
    }>
  > {
    const role = req['user']?.role;

    const athlete = await this.athletesService.createAthlete(athleteDto, role);

    return {
      data: athlete,
    };
  }
}
