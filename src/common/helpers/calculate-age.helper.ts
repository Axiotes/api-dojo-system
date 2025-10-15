export const calculateAge = (birthDate: Date): number => {
  const today = new Date();

  return today.getFullYear() - birthDate.getFullYear();
};
