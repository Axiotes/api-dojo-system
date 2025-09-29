import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

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

  @UseGuards(OptionalJwtGuard)
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
