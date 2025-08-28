import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { ClassDto } from '@ds-modules/classes/dtos/class.dto';

@ValidatorConstraint({ async: false })
export class AgeConstraint implements ValidatorConstraintInterface {
  public validate(maxAge: number, args: ValidationArguments): boolean {
    const obj = args.object as ClassDto;
    const min = obj.minAge;
    const max = obj.maxAge;

    if (!max) return true;

    return min < max;
  }

  public defaultMessage(): string {
    return 'min age must be less than max age';
  }
}
