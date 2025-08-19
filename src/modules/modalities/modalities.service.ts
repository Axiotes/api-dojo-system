import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Modalities } from './schemas/modalities.schema';

import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';

@Injectable()
export class ModalitiesService {
  constructor(
    @InjectModel(Modalities.name) private modalitiesModel: Model<Modalities>,
  ) {}

  public async createModality(
    newModality: ModalitiesDocument,
  ): Promise<ModalitiesDocument> {
    const modality = await this.modalitiesModel
      .findOne({
        name: newModality.name,
      })
      .exec();

    if (modality) {
      throw new ConflictException(
        `Modality with name ${newModality.name} already exists.`,
      );
    }

    return await this.modalitiesModel.create(newModality);
  }

  public async findOneModality(id: string): Promise<ModalitiesDocument> {
    const modality = await this.modalitiesModel
      .findOne({
        _id: id,
      })
      .exec();

    if (!modality) {
      throw new NotFoundException('Modality not found');
    }

    return modality;
  }
}
