import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { FindClassesDto } from '@ds-modules/classes/dtos/find-classes.dto';

@ValidatorConstraint({ async: false })
export class HourParamConstraint implements ValidatorConstraintInterface {
  public validate(endHour: number, args: ValidationArguments): boolean {
    const obj = args.object as FindClassesDto;
    const start = obj.startHour;
    const end = obj.endHour;

    if (start && end) return true;

    return false;
  }

  public defaultMessage(): string {
    return '"startHour" and "endHour" parameters must be entered together';
  }
}
