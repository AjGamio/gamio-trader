import * as moment from 'moment-timezone';

export function getTimeInTimeZone(timeZone: string) {
  const currentTimeWithTimeZone = moment().tz(timeZone).format('HH:mm:ss');

  console.log('Current Time with Time Zone:', currentTimeWithTimeZone);

  return currentTimeWithTimeZone;
}

export function getRangeInTimeZone({
  timeZone,
  rangeDurationInMins,
}: {
  timeZone: string;
  rangeDurationInMins: number;
}) {
  const rangeStartTimeWithTimeZone = moment()
    .tz(timeZone)
    .subtract(rangeDurationInMins, 'minutes');
  const rangeEndTimeWithTimeZone = moment().tz(timeZone);

  console.log(
    'Range Start Time with Time Zone:',
    rangeStartTimeWithTimeZone.format('HH:mm'),
  );
  console.log(
    'Range End Time with Time Zone:',
    rangeEndTimeWithTimeZone.format('HH:mm'),
  );

  return {
    startTime: rangeStartTimeWithTimeZone.format('HH:mm'),
    endTime: rangeEndTimeWithTimeZone.format('HH:mm'),
  };
}

export function convertTo24HourFormat(timeString: string) {
  const convertedTime = moment(timeString, 'hh:mm A').format('HH:mm');

  console.log('Converted Time (24-hour format):', convertedTime);

  return convertedTime;
}

export function getCurrentTimeInHHMMFormat() {
  const currentDate = new Date();
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}
