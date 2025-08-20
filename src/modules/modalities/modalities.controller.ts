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

@Controller('modalities')
@UseInterceptors(ImageBase64Interceptor)
export class ModalitiesController {
  constructor(
    private readonly modalitiesService: ModalitiesService,
    private readonly reduceImagePipe: ReduceImagePipe,
  ) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Cadastra uma nova modalidade',
    description:
      'Apenas usuários com token jwt e cargos "admin" podem utilizar este endpoint',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Nome da modalidade',
          example: 'Judô',
        },
        description: {
          type: 'string',
          description: 'Descrição da modalidade',
          example: `O Judô é uma arte marcial de origem japonesa, criada em 1882 pelo mestre Jigoro Kano.`,
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagem da modalidade (jpg, jpeg, png, gif)',
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
    summary: 'Busca modalidade por ID',
  })
  @Throttle({
    default: {
      limit: 30,
      ttl: 60000,
    },
  })
  @Get(':id')
  public async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<ModalitiesDocument>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id format');
    }

    const modality = await this.modalitiesService.findById(id);

    return {
      data: modality,
    };
  }

  @ApiOperation({
    summary: 'Busca modalidades',
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

  @UploadImage()
  @Patch(':id')
  public async update(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
    @Body() updateDto?: UpdateModalityDto,
  ): Promise<ApiResponse<ModalitiesDocument>> {
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
}
