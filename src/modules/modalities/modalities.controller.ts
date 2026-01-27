import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { Types } from 'mongoose';

import { ModalitiesService } from './modalities.service';
import { ModalityDto } from './dtos/modality.dto';
import { FindModalitiesDto } from './dtos/find-modalities.dto';
import { UpdateModalityDto } from './dtos/update-modality.dto';

import { ApiResponse } from '@ds-types/api-response.type';
import { ModalitiesDocument } from '@ds-types/documents/modalitie-document.type';
import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { ImageBase64Interceptor } from '@ds-common/interceptors/image-base64/image-base64.interceptor';
import { UploadImage } from '@ds-common/decorators/upload-image.decorator';
import { RoleGuard } from '@ds-common/guards/role/role.guard';
import { Roles } from '@ds-common/decorators/roles.decorator';
import { TranslateService } from '@ds-services/translate/translate.service';
import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { ModuleName } from '@ds-enums/module-name.enum';
import { UserMessage } from '@ds-enums/user-message.enum';

@Controller('modalities')
@UseInterceptors(ImageBase64Interceptor)
export class ModalitiesController {
  constructor(
    private readonly modalitiesService: ModalitiesService,
    private readonly reduceImagePipe: ReduceImagePipe,
    private readonly translateService: TranslateService,
  ) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'docs.MODALITIES.REGISTER_SUMMARY',
    description: 'docs.MODALITIES.REGISTER_DESCRIPTION',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'docs.MODALITIES.NAME_DESCRIPTION',
          example: 'docs.MODALITIES.NAME_EXAMPLE',
        },
        description: {
          type: 'string',
          description: 'docs.MODALITIES.DESCRIPTION_DESCRIPTION',
          example: `docs.MODALITIES.DESCRIPTION_EXAMPLE`,
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'docs.MODALITIES.IMAGE_DESCRIPTION',
        },
      },
      required: ['name', 'description', 'image'],
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @UploadImage()
  @Post()
  public async createModality(
    @Body() modalityDto: ModalityDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<ModalitiesDocument>> {
    const reducedImageBuffer = await this.reduceImagePipe.transform(file);

    const newModality = {
      ...modalityDto,
      image: reducedImageBuffer,
    } as ModalitiesDocument;

    const modality = await this.modalitiesService.createModality(newModality);

    return {
      data: modality,
    };
  }

  @ApiOperation({
    summary: 'docs.MODALITIES.FIND_BY_ID_SUMMARY',
    description: 'docs.MODALITIES.FIND_BY_ID_DESCRIPTION',
  })
  @Throttle({
    default: {
      limit: 30,
      ttl: 60000,
    },
  })
  @Get('id/:id')
  public async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<ModalitiesDocument>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.COMMON,
            message: UserMessage.INVALID_ID,
          },
          { args: { property: 'id' } },
        ),
      );
    }

    const modality = await this.modalitiesService.findById(
      new Types.ObjectId(id),
      [],
    );

    return {
      data: modality,
    };
  }

  @ApiOperation({
    summary: 'docs.MODALITIES.FIND_ALL_SUMMARY',
    description: 'docs.MODALITIES.FIND_ALL_DESCRIPTION',
  })
  @Throttle({
    default: {
      limit: 30,
      ttl: 60000,
    },
  })
  @Get()
  public async findAll(
    @Query() queryParams: FindModalitiesDto,
  ): Promise<ApiResponse<ModalitiesDocument[]>> {
    const modalities = await this.modalitiesService.findAll(queryParams);

    return {
      data: modalities,
      pagination: {
        skip: queryParams.skip,
        limit: queryParams.limit,
      },
      total: modalities.length,
    };
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'docs.MODALITIES.UPDATE_SUMMARY',
    description: 'docs.MODALITIES.UPDATE_DESCRIPTION',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'docs.MODALITIES.NAME_DESCRIPTION',
          example: 'docs.MODALITIES.NAME_EXAMPLE',
        },
        description: {
          type: 'string',
          description: 'docs.MODALITIES.DESCRIPTION_DESCRIPTION',
          example: `docs.MODALITIES.DESCRIPTION_EXAMPLE`,
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'docs.MODALITIES.IMAGE_DESCRIPTION',
        },
      },
      required: [],
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @UploadImage()
  @Patch(':id')
  public async update(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
    @Body() updateDto?: UpdateModalityDto,
  ): Promise<ApiResponse<ModalitiesDocument>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.COMMON,
            message: UserMessage.INVALID_ID,
          },
          { args: { property: 'id' } },
        ),
      );
    }

    let modality: Partial<ModalitiesDocument> = {
      _id: id,
      ...updateDto,
    };

    if (file) {
      const reducedImageBuffer = await this.reduceImagePipe.transform(file);

      modality = {
        ...modality,
        image: reducedImageBuffer,
      };
    }

    const updatedModality = await this.modalitiesService.update(modality);

    return {
      data: updatedModality,
    };
  }

  @ApiOperation({
    summary: 'docs.MODALITIES.DEACTIVATE_SUMMARY',
    description: `docs.MODALITIES.DEACTIVATE_DESCRIPTION`,
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @Patch('deactivate/:id')
  public async deactivate(
    @Param('id') id: string,
  ): Promise<ApiResponse<string>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.COMMON,
            message: UserMessage.INVALID_ID,
          },
          { args: { property: 'id' } },
        ),
      );
    }

    await this.modalitiesService.deactivate(id);

    return {
      data: this.translateService.translate({
        i18nFile: I18nFiles.ERRORS,
        module: ModuleName.MODALITIES,
        message: UserMessage.DEACTIVATED,
      }),
    };
  }

  @ApiOperation({
    summary: 'docs.MODALITIES.REACTIVATE_SUMMARY',
    description: 'docs.MODALITIES.REACTIVATE_DESCRIPTION',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @Patch('reactivate/:id')
  public async reactivate(
    @Param('id') id: string,
  ): Promise<ApiResponse<string>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        this.translateService.translate(
          {
            i18nFile: I18nFiles.ERRORS,
            module: ModuleName.COMMON,
            message: UserMessage.INVALID_ID,
          },
          { args: { property: 'id' } },
        ),
      );
    }

    const modality = await this.modalitiesService.findById(
      new Types.ObjectId(id),
      ['status'],
    );

    await this.modalitiesService.setStatus(modality, true);

    return {
      data: this.translateService.translate({
        i18nFile: I18nFiles.ERRORS,
        module: ModuleName.MODALITIES,
        message: UserMessage.REACTIVATED,
      }),
    };
  }
}
