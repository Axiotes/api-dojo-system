import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { FindClassesDto } from '@ds-modules/classes/dtos/find-classes.dto';
import { TranslateService } from '@ds-services/translate/translate.service';
import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { ModuleName } from '@ds-enums/module-name.enum';
import { Message } from '@ds-enums/message.enum';

@ValidatorConstraint({ async: false })
export class AgeParamConstraint implements ValidatorConstraintInterface {
  constructor(private readonly translateService: TranslateService) {}

  public validate(maxAge: number, args: ValidationArguments): boolean {
    const obj = args.object as FindClassesDto;
    const min = obj.minAge;
    const max = obj.maxAge;

    if (min && max) return true;

    return false;
  }

  public defaultMessage(args: ValidationArguments): string {
    const obj = args.object as FindClassesDto;
    const min = obj.minAge;
    const max = obj.maxAge;

    return this.translateService.translate(
      {
        i18nFile: I18nFiles.ERRORS,
        module: ModuleName.COMMON,
        message: Message.AGE_CONSTRAINT,
      },
      {
        args: {
          minAge: min.toString(),
          maxAge: max.toString(),
        },
      },
    );
  }
}
