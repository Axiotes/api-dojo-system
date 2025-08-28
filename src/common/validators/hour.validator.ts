import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { ClassDto } from '@ds-modules/classes/dtos/class.dto';

@ValidatorConstraint({ async: false })
export class HourConstraint implements ValidatorConstraintInterface {
  public validate(endHour: number, args: ValidationArguments): boolean {
    const obj = args.object as ClassDto;
    const start = obj.startHour;
    const end = obj.endHour;

    return start < end;
  }

  public defaultMessage(): string {
    return 'start time must be less than end time';
  }
}
