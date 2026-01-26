import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { ClassDto } from '@ds-modules/classes/dtos/class.dto';
import { TranslateService } from '@ds-services/translate/translate.service';
import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { ModuleName } from '@ds-enums/module-name.enum';
import { UserMessage } from '@ds-enums/user-message.enum';

@ValidatorConstraint({ async: false })
export class AgeConstraint implements ValidatorConstraintInterface {
  constructor(private readonly translateService: TranslateService) {}

  public validate(maxAge: number, args: ValidationArguments): boolean {
    const obj = args.object as ClassDto;
    const min = obj.minAge;
    const max = obj.maxAge;

    if (!max) return true;

    return min < max;
  }

  defaultMessage(args: ValidationArguments): string {
    const obj = args.object as ClassDto;

    return this.translateService.translate(
      {
        i18nFile: I18nFiles.ERRORS,
        module: ModuleName.COMMON,
        message: UserMessage.AGE_CONSTRAINT,
      },
      {
        args: { minAge: obj.minAge.toString(), maxAge: obj.maxAge.toString() },
      },
    );
  }
}
