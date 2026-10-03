export function validScheduleTime(value: string, now = Date.now()): boolean {
  const time = Date.parse(value);
  return Number.isFinite(time) && time > now + 60000 && time < now + 366 * 86400000;
}
