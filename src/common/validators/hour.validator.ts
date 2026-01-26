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
export class HourConstraint implements ValidatorConstraintInterface {
  constructor(private readonly translateService: TranslateService) {}

  public validate(endHour: number, args: ValidationArguments): boolean {
    const obj = args.object as ClassDto;
    const start = obj.startHour;
    const end = obj.endHour;

    return start < end;
  }

  public defaultMessage(args: ValidationArguments): string {
    const obj = args.object as ClassDto;
    const start = obj.startHour ?? '00:00';
    const end = obj.endHour ?? '00:00';

    return this.translateService.translate(
      {
        i18nFile: I18nFiles.ERRORS,
        module: ModuleName.COMMON,
        message: UserMessage.HOUR_CONSTRAINT,
      },
      {
        args: { startHour: start, endHour: end },
      },
    );
  }
}
