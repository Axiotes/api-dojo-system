import { Email } from './email.type';

export type SingleEmail = Email & {
  recipient: string;
};
