import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Modalities } from './schemas/modalities.schema';
import { ModalityDto } from './dtos/modality.dto';

import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';

@Injectable()
export class ModalitiesService {
  constructor(
    @InjectModel(Modalities.name) private modalitiesModel: Model<Modalities>,
  ) {}

  public async createModality(
    modalityDto: ModalityDto,
  ): Promise<ModalitiesDocument> {
    const modality = await this.modalitiesModel
      .findOne({
        name: modalityDto.name,
      })
      .exec();

    if (modality) {
      throw new ConflictException(
        `Modality with name ${modalityDto.name} already exists.`,
      );
    }

    return await this.modalitiesModel.create(modalityDto);
  }
}
