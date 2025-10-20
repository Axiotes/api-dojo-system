export const calculateAge = (dateBirth: Date): number => {
  const today = new Date();
  const monthDiff = today.getMonth() - dateBirth.getMonth();
  let age = today.getFullYear() - dateBirth.getFullYear();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateBirth.getDate())
  ) {
    age--;
  }

  return age;
};
