import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { Age } from '@ds-types/age.type';

@ValidatorConstraint({ async: false })
export class AgeConstraint implements ValidatorConstraintInterface {
  public validate(age: Age, args: ValidationArguments): boolean {
    const obj = args.object as Age;
    const min = obj.min;
    const max = obj.max;

    if (!max) return true;

    return min < max;
  }

  public defaultMessage(): string {
    return 'min age must be less than max age';
  }
}
