import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { I18nService } from 'nestjs-i18n';

import { ClassDto } from '@ds-modules/classes/dtos/class.dto';

@ValidatorConstraint({ async: false })
export class AgeConstraint implements ValidatorConstraintInterface {
  constructor(private readonly i18n: I18nService) {}

  public validate(maxAge: number, args: ValidationArguments): boolean {
    const obj = args.object as ClassDto;
    const min = obj.minAge;
    const max = obj.maxAge;

    if (!max) return true;

    return min < max;
  }

  defaultMessage(args: ValidationArguments): string {
    const obj = args.object as ClassDto;

    return this.i18n.translate('errors.COMMON.AGE_CONSTRAINT', {
      args: { minAge: obj.minAge, maxAge: obj.maxAge },
    });
  }
}
