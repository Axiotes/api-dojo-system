import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { AthletesService } from './athletes.service';
import { AthleteDto } from './dtos/athlete.dto';

import { OptionalJwtGuard } from '@ds-common/guards/optional-jwt/optional-jwt.guard';

@Controller('athletes')
export class AthletesController {
  constructor(private readonly athletesService: AthletesService) {}

  @UseGuards(OptionalJwtGuard)
  @Post()
  public async createAthlete(
    @Body() athleteDto: AthleteDto,
    @Req() req: Request,
  ) {
    const role = req['user']?.role;

    const athlete = this.athletesService.createAthlete(athleteDto, role);

    return {
      data: athlete,
    };
  }
}
