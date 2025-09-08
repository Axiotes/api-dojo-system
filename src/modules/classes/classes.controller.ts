import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
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
import { Types } from 'mongoose';
import { Request } from 'express';

import { ClassesService } from './classes.service';
import { ClassDto } from './dtos/class.dto';
import { FindClassesDto } from './dtos/find-classes.dto';

import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { UploadImage } from '@ds-common/decorators/upload-image.decorator';
import { ApiResponse } from '@ds-types/api-response.type';
import { ClassDocument } from '@ds-types/documents/class-document.type';
import { ImageBase64Interceptor } from '@ds-common/interceptors/image-base64/image-base64.interceptor';
import { RoleGuard } from '@ds-common/guards/role/role.guard';
import { Roles } from '@ds-common/decorators/roles.decorator';
import { OptionalJwtGuard } from '@ds-common/guards/optional-jwt/optional-jwt.guard';

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

    const newClass = {
      ...rest,
      teacher: new Types.ObjectId(classDto.teacher),
      modality: new Types.ObjectId(classDto.modality),
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

  @ApiOperation({
    summary: 'Buscar uma turma por ID',
    description: `Qualquer usuário pode realizar está ação. No entanto, 
      apenas usuários com token jwt e cargos "admin" recebem
      informações privilegiadas sobre a turma`,
  })
  @UseGuards(OptionalJwtGuard)
  @Throttle({
    default: {
      limit: 30,
      ttl: 60000,
    },
  })
  @Get('id/:id')
  public async findById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ApiResponse<ClassDocument>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id format');
    }

    const classDoc = await this.classesService.findById(new Types.ObjectId(id));
    const role = req['user']?.role;

    return {
      data: await this.classesService.formatClassByRole(classDoc, role),
    };
  }

  @ApiOperation({
    summary: 'Buscar turmas com paginação e filtros',
    description: `Qualquer usuário pode realizar está ação. No entanto, 
      apenas usuários com token jwt e cargos "admin" recebem
      informações privilegiadas sobre as turmas`,
  })
  @UseGuards(OptionalJwtGuard)
  @Throttle({
    default: {
      limit: 30,
      ttl: 60000,
    },
  })
  @Get()
  public async findAll(
    @Query() queryParams: FindClassesDto,
    @Req() req: Request,
  ): Promise<ApiResponse<ClassDocument[]>> {
    const classes = await this.classesService.findAll(queryParams);
    const role = req['user']?.role;

    const classesPromises = classes.map(
      async (classDoc) =>
        await this.classesService.formatClassByRole(classDoc, role),
    );
    const formatedClasses = await Promise.all(classesPromises);

    return {
      data: formatedClasses,
      pagination: {
        skip: queryParams.skip,
        limit: queryParams.limit,
      },
      total: formatedClasses.length,
    };
  }
}
