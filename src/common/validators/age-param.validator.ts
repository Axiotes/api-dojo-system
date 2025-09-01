import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { FindClassesDto } from '@ds-modules/classes/dtos/find-classes.dto';

@ValidatorConstraint({ async: false })
export class AgeParamConstraint implements ValidatorConstraintInterface {
  public validate(maxAge: number, args: ValidationArguments): boolean {
    const obj = args.object as FindClassesDto;
    const min = obj.minAge;
    const max = obj.maxAge;

    if (min && max) return true;

    return false;
  }

  public defaultMessage(): string {
    return '"minAge" and "maxAge" parameters must be entered together';
  }
}
