const SEOUL_TIME_ZONE = 'Asia/Seoul';

export function getSeoulDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function getDateParts(date: string): { year: string; month: string; day: string } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error(`Invalid date: ${date}`);
  return { year: match[1]!, month: match[2]!, day: match[3]! };
}
