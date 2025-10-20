import { Email } from './email.type';

export type MultipleEmail<T> = Email<T> & {
  recipients: string[];
};
