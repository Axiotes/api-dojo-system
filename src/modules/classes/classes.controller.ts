import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
} from '@nestjs/swagger';

import { ClassesService } from './classes.service';
import { ClassDto } from './dtos/class.dto';

import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { UploadImage } from '@ds-common/decorators/upload-image.decorator';
import { ApiResponse } from '@ds-types/api-response.type';
import { ClassDocument } from '@ds-types/documents/class-document.type';
import { ImageBase64Interceptor } from '@ds-common/interceptors/image-base64/image-base64.interceptor';
import { RoleGuard } from '@ds-common/guards/role/role.guard';
import { Roles } from '@ds-common/decorators/roles.decorator';

@UseInterceptors(ImageBase64Interceptor)
@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly reduceImagePipe: ReduceImagePipe,
  ) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Cadastra uma nova turma',
    description:
      'Apenas usuários com token jwt e cargos "admin" podem utilizar este endpoint',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        modality: {
          type: 'string',
          example: '64f1b2a3c4d5e6f7890abc12',
          description: 'ID da modalidade (ObjectId do MongoDB)',
        },
        teacher: {
          type: 'string',
          example: '64f1b2a3c4d5e6f7890abc12',
          description: 'ID do professor (ObjectId do MongoDB)',
        },
        startHour: {
          type: 'string',
          example: '08:30',
          description: 'Horário de início da aula (HH:MM)',
        },
        endHour: {
          type: 'string',
          example: '08:30',
          description: 'Horário de término da aula (HH:MM)',
        },
        minAge: {
          type: 'number',
          example: '10',
          description: 'Idade mínima dos alunos',
        },
        maxAge: {
          type: 'number',
          example: '13',
          description: 'Idade máxima dos alunos',
        },
        maxAthletes: {
          type: 'number',
          example: '15',
          description: 'Máximo de atletas',
        },
        weekDays: {
          type: 'array',
          description: 'Dias da semana',
          items: {
            type: 'string',
            enum: [
              'Segunda-feira',
              'Terça-feira',
              'Quarta-feira',
              'Quinta-feira',
              'Sexta-feira',
              'Sábado',
              'Domingo',
            ],
            example: 'Segunda-feira',
          },
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagem da modalidade (jpg, jpeg, png, gif)',
        },
      },
      required: [
        'modality',
        'teacher',
        'startHour',
        'endHour',
        'minAge',
        'maxAge',
        'maxAthletes',
        'weekDays',
        'image',
      ],
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @UploadImage()
  @Post()
  public async createClass(
    @UploadedFile() file: Express.Multer.File,
    @Body() classDto: ClassDto,
  ): Promise<ApiResponse<ClassDocument>> {
    const reducedImageBuffer = await this.reduceImagePipe.transform(file);

    const { startHour, endHour, minAge, maxAge, ...rest } = classDto;

    const newClass: ClassDocument = {
      ...rest,
      hour: {
        start: startHour,
        end: endHour,
      },
      age: {
        min: minAge,
        max: maxAge,
      },
      image: reducedImageBuffer,
    } as ClassDocument;

    const modality = await this.classesService.createClass(newClass);

    return {
      data: modality,
    };
  }
}
