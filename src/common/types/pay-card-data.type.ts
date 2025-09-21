export type PayCardData = {
  cardToken: string;
  payerEmail: string;
  amount: number;
  installments?: number;
  cardNumber: string;
};
