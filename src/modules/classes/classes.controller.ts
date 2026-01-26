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
import { TranslateService } from '@ds-services/translate/translate.service';
import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { ModuleName } from '@ds-enums/module-name.enum';
import { UserMessage } from '@ds-enums/user-message.enum';

@UseInterceptors(ImageBase64Interceptor)
@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly reduceImagePipe: ReduceImagePipe,
    private readonly translateService: TranslateService,
  ) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'docs.CLASSES.REGISTER_SUMMARY',
    description: 'docs.CLASSES.REGISTER_DESCRIPTION',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        modality: {
          type: 'string',
          example: '64f1b2a3c4d5e6f7890abc12',
          description: 'docs.CLASSES.MODALITY_ID_PROPERTY',
        },
        teacher: {
          type: 'string',
          example: '64f1b2a3c4d5e6f7890abc12',
          description: 'docs.CLASSES.TEACHER_ID_PROPERTY',
        },
        startHour: {
          type: 'string',
          example: '08:30',
          description: 'docs.CLASSES.START_HOUR_PROPERTY',
        },
        endHour: {
          type: 'string',
          example: '08:30',
          description: 'docs.CLASSES.END_HOUR_PROPERTY',
        },
        minAge: {
          type: 'number',
          example: '10',
          description: 'docs.CLASSES.MIN_AGE_PROPERTY',
        },
        maxAge: {
          type: 'number',
          example: '13',
          description: 'docs.CLASSES.MAX_AGE_PROPERTY',
        },
        maxAthletes: {
          type: 'number',
          example: '15',
          description: 'docs.CLASSES.MAX_ATHLETES_PROPERTY',
        },
        weekDays: {
          type: 'array',
          description: 'docs.CLASSES.WEEKDAYS_PROPERTY',
          items: {
            type: 'string',
            enum: [
              'docs.CLASSES.WEEKDAYS_ENUM.MONDAY',
              'docs.CLASSES.WEEKDAYS_ENUM.TUESDAY',
              'docs.CLASSES.WEEKDAYS_ENUM.WEDNESDAY',
              'docs.CLASSES.WEEKDAYS_ENUM.THURSDAY',
              'docs.CLASSES.WEEKDAYS_ENUM.FRIDAY',
              'docs.CLASSES.WEEKDAYS_ENUM.SATURDAY',
              'docs.CLASSES.WEEKDAYS_ENUM.SUNDAY',
            ],
            example: 'docs.CLASSES.WEEKDAYS_ENUM.MONDAY',
          },
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'docs.CLASSES.IMAGE_PROPERTY',
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
    summary: 'docs.CLASSES.FIND_BY_ID_SUMMARY',
    description: 'docs.CLASSES.FIND_BY_ID_DESCRIPTION',
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

    const classDoc = await this.classesService.findById(
      new Types.ObjectId(id),
      [],
    );
    const role = req['user']?.role;

    return {
      data: await this.classesService.formatClassByRole(classDoc, role),
    };
  }

  @ApiOperation({
    summary: 'docs.CLASSES.FIND_ALL_SUMMARY',
    description: 'docs.CLASSES.FIND_ALL_DESCRIPTION',
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
