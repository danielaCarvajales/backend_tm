import * as moment from 'moment-timezone';

const COLOMBIA_TZ = 'America/Bogota';

export function nowColombia(): Date {
  return moment().tz(COLOMBIA_TZ).toDate();
}
