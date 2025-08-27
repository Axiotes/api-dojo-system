import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
} from '@nestjs/swagger';

import { TeachersService } from './teachers.service';
import { TeacherDto } from './dtos/teacher.dto';

import { UploadImage } from '@ds-common/decorators/upload-image.decorator';
import { ReduceImagePipe } from '@ds-common/pipes/reduce-image/reduce-image.pipe';
import { TeacherDocument } from '@ds-types/documents/teacher-document.type';
import { ImageBase64Interceptor } from '@ds-common/interceptors/image-base64/image-base64.interceptor';
import { ApiResponse } from '@ds-types/api-response.type';
import { Roles } from '@ds-common/decorators/roles.decorator';
import { RoleGuard } from '@ds-common/guards/role/role.guard';

@UseInterceptors(ImageBase64Interceptor)
@Controller('teachers')
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
    private readonly reduceImagePipe: ReduceImagePipe,
  ) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Cadastra um novo professor',
    description:
      'Apenas usuários com token jwt e cargos "admin" podem utilizar este endpoint',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Nome do professor',
          example: 'Marcos Silva',
        },
        cpf: {
          type: 'string',
          description: 'CPF do professor (apenas números)',
          example: '12345678910',
        },
        email: {
          type: 'string',
          description: 'Email do professor',
          example: 'marcossilva@gmail.com',
        },
        hourPrice: {
          type: 'number',
          description: 'Valor da hora/aula do professor',
          example: '5.0',
        },
        description: {
          type: 'string',
          description: 'Descrição da modalidade',
          example: `Faixa Preta 3º Dan. Com mais de 15 anos de experiência no judô.`,
        },
        modalities: {
          type: 'array',
          description: 'IDs das modalidades (ObjectId do MongoDB)',
          items: {
            type: 'string',
            example: '64f1b2a3c4d5e6f7890abc12',
          },
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagem da modalidade (jpg, jpeg, png, gif)',
        },
      },
      required: [
        'name',
        'cpf',
        'email',
        'hourPrice',
        'description',
        'modalities',
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
  public async createTeacher(
    @UploadedFile() file: Express.Multer.File,
    @Body() teacherDto: TeacherDto,
  ): Promise<ApiResponse<TeacherDocument>> {
    const reducedImageBuffer = await this.reduceImagePipe.transform(file);

    const newTeacher = {
      ...teacherDto,
      image: reducedImageBuffer,
    } as TeacherDocument;

    const teacher = await this.teachersService.createTeacher(newTeacher);

    return {
      data: teacher,
    };
  }
}
