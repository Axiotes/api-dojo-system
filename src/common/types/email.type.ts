export type Email<T> = {
  subject: string;
  template: string;
  context: T;
  text?: string;
};
