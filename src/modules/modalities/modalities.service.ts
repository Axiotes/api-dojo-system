import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Modalities } from './schemas/modalities.schema';
import { FindModalitiesDto } from './dtos/find-modalities.dto';

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

  public async findById(id: string): Promise<ModalitiesDocument> {
    const modality = await this.modalitiesModel.findById(id).exec();

    if (!modality) {
      throw new NotFoundException('Modality not found');
    }

    return modality;
  }

  public async findAll(
    queryParams: FindModalitiesDto,
  ): Promise<ModalitiesDocument[]> {
    const query = this.modalitiesModel
      .find()
      .skip(queryParams.skip)
      .limit(queryParams.limit);

    if (queryParams.status) {
      query.where('status').equals(queryParams.status);
    }

    return await query.exec();
  }

  public async update(
    updateModality: Partial<ModalitiesDocument>,
  ): Promise<ModalitiesDocument> {
    const modality = await this.findById(updateModality._id as string);

    if (updateModality.name && updateModality.name != modality.name) {
      const nameExist = await this.modalitiesModel
        .findOne({
          name: updateModality.name,
        })
        .exec();

      if (nameExist) {
        throw new ConflictException(
          `Modality with name ${updateModality.name} already exists.`,
        );
      }
    }

    const modalityUpdates = {
      name: updateModality.name || modality.name,
      description: updateModality.description || modality.description,
      image: updateModality.image || modality.image,
    };

    return await this.modalitiesModel
      .findByIdAndUpdate(modality.id, modalityUpdates, { new: true })
      .exec();
  }
}
