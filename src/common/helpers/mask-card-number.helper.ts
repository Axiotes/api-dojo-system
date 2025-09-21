export const maskCardNumber = (cardNumber: string): string =>
  cardNumber
    .replace(/\D/g, '')
    .replace(/.(?=.{4})/g, '*')
    .replace(/(.{4})/g, '$1 ')
    .trim();
