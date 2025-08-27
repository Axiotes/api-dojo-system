import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { HourDto } from '@ds-modules/classes/dtos/hour.dto';
import { Hour } from '@ds-types/hour.type';

@ValidatorConstraint({ async: false })
export class HourConstraint implements ValidatorConstraintInterface {
  public validate(hour: HourDto, args: ValidationArguments): boolean {
    const obj = args.object as Hour;
    const start = obj.start;
    const end = obj.end;

    if (!start || !end) return false;

    const startHour = Number(start.split(':')[0]);
    const startMinute = Number(start.split(':')[1]);
    const endHour = Number(end.split(':')[0]);
    const endMinute = Number(end.split(':')[1]);

    if (
      startHour > endHour ||
      (startHour == endHour && startMinute > endMinute)
    ) {
      return false;
    }

    return true;
  }

  public defaultMessage(): string {
    return 'start time must be less than end time';
  }
}
