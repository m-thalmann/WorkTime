export const DaysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

export type DayOfWeek = (typeof DaysOfWeek)[number];
