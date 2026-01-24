import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Modalities } from './schemas/modalities.schema';
import { FindModalitiesDto } from './dtos/find-modalities.dto';

import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';
import { PlansService } from '@ds-modules/plans/plans.service';
import { TeachersService } from '@ds-modules/teachers/teachers.service';
import { ClassesService } from '@ds-modules/classes/classes.service';
import { TranslateService } from '@ds-services/translate/translate.service';
import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { ModuleName } from '@ds-enums/module-name.enum';
import { Message } from '@ds-enums/message.enum';

@Injectable()
export class ModalitiesService {
  constructor(
    @InjectModel(Modalities.name) private modalitiesModel: Model<Modalities>,
    private readonly plansService: PlansService,

    @Inject(forwardRef(() => ClassesService))
    private readonly classesService: ClassesService,
    @Inject(forwardRef(() => TeachersService))
    private readonly teachersService: TeachersService,

    private readonly translateService: TranslateService,
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
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.MODALITIES,
            message: Message.NAME_EXISTS,
          },
          { args: { name: newModality.name } },
        ),
      );
    }

    return await this.modalitiesModel.create(newModality);
  }

  public async findById<K extends keyof ModalitiesDocument>(
    id: Types.ObjectId,
    fields: K[],
  ): Promise<ModalitiesDocument> {
    const projection = Object.fromEntries(fields.map((key) => [key, 1]));

    const modality = await this.modalitiesModel.findById(id, projection).exec();

    if (!modality) {
      throw new NotFoundException(
        this.translateService.translate({
          i18nFile: I18nFiles.ERRORS,
          module: ModuleName.MODALITIES,
          message: Message.NOT_FOUND,
        }),
      );
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

    if (queryParams.status !== undefined) {
      query.where('status').equals(queryParams.status);
    }

    return await query.exec();
  }

  public async update(
    updateModality: Partial<ModalitiesDocument>,
  ): Promise<ModalitiesDocument> {
    const modality = await this.findById(
      updateModality._id as Types.ObjectId,
      [],
    );

    if (updateModality.name && updateModality.name != modality.name) {
      const nameExist = await this.modalitiesModel
        .findOne({
          name: updateModality.name,
        })
        .exec();

      if (nameExist) {
        throw new ConflictException(
          this.translateService.translate(
            {
              i18nFile: I18nFiles.ERRORS,
              module: ModuleName.MODALITIES,
              message: Message.NAME_EXISTS,
            },
            { args: { name: updateModality.name } },
          ),
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

  public async deactivate(id: string): Promise<void> {
    const modality = await this.findById(new Types.ObjectId(id), [
      'id',
      'status',
    ]);

    const plans = await this.plansService.findByModality(modality.id, ['id']);

    if (plans.length > 0) {
      throw new ConflictException(
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.MODALITIES,
            message: Message.CANNOT_DEACTIVATE,
          },
          {
            args: {
              cause: this.translateService.translate({
                i18nFile: I18nFiles.ERRORS,
                module: ModuleName.MODALITIES,
                message: Message.CAUSE_PLAN,
              }),
            },
          },
        ),
      );
    }

    const teachers = await this.teachersService.findByModality(modality.id, [
      'id',
    ]);

    if (teachers.length > 0) {
      throw new ConflictException(
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.MODALITIES,
            message: Message.CANNOT_DEACTIVATE,
          },
          {
            args: {
              cause: this.translateService.translate({
                i18nFile: I18nFiles.ERRORS,
                module: ModuleName.MODALITIES,
                message: Message.CAUSE_TEACHER,
              }),
            },
          },
        ),
      );
    }

    const classes = await this.classesService.findBy('modality', modality.id, [
      'id',
    ]);

    if (classes.length > 0) {
      throw new ConflictException(
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.MODALITIES,
            message: Message.CANNOT_DEACTIVATE,
          },
          {
            args: {
              cause: this.translateService.translate({
                i18nFile: I18nFiles.ERRORS,
                module: ModuleName.MODALITIES,
                message: Message.CAUSE_CLASS,
              }),
            },
          },
        ),
      );
    }

    this.setStatus(modality, false);
  }

  public async setStatus(
    modality: ModalitiesDocument,
    status: boolean,
  ): Promise<void> {
    modality.status = status;
    await modality.save();
  }
}
