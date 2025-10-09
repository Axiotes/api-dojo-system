import { Email } from './email.type';

export type SingleEmail<T> = Email<T> & {
  recipient: string;
};
