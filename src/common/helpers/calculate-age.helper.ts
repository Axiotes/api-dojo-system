export const calculateAge = (dateBirth: Date): number => {
  const today = new Date();

  return today.getFullYear() - dateBirth.getFullYear();
};
