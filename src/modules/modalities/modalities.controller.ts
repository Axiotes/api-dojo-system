import { Body, Controller, Post } from '@nestjs/common';

import { ModalitiesService } from './modalities.service';
import { ModalityDto } from './dtos/modality.dto';

import { ApiResponse } from '@ds-types/api-response.type';
import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';

@Controller('modalities')
export class ModalitiesController {
  constructor(private readonly modalitiesService: ModalitiesService) {}

  @Post()
  public async createModality(
    @Body() modalityDto: ModalityDto,
  ): Promise<ApiResponse<ModalitiesDocument>> {
    const modality = await this.modalitiesService.createModality(modalityDto);

    return {
      data: modality,
    };
  }
}
