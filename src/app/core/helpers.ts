export const getStartOfWeek = (date: Date) => {
  let d = new Date(date);
  let day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);

  return d;
};
