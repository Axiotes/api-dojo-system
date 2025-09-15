export const hoursText = (hours: number): string => {
  const hour = Math.floor(hours);
  const minute = Math.round((hours - hour) * 60);
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');

  let text = `${hh} hora(s)`;

  if (minute > 0) {
    text = text + ` e ${mm} minuto(s)`;
  }

  return text;
};
