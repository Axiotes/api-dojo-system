import { Email } from './email.type';

export type MultipleEmail = Email & {
  recipients: string[];
};
