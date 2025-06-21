import { CalendarEvent, TimezoneInfo } from './types';

export const parseICS = (icsData: string): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let match;

  while ((match = eventRegex.exec(icsData)) !== null) {
    const eventData = match[1];
    const event: Partial<CalendarEvent> = {};

    const getProp = (propName: string): string | null => {
      const propRegex = new RegExp(`^${propName}(?:;.+?)?:(.*)$`, 'im');
      const propMatch = eventData.match(propRegex);
      return propMatch
        ? propMatch[1].trim().replace(/\\,/g, ',').replace(/\\n/g, '\n')
        : null;
    };

    event.uid = getProp('UID');
    event.summary = getProp('SUMMARY');
    event.description = getProp('DESCRIPTION');
    event.location = getProp('LOCATION');
    event.dtstart = getProp('DTSTART');
    event.dtend = getProp('DTEND');
    event.status = getProp('STATUS');
    event.organizer = getProp('ORGANIZER');

    const attendeeRegex = /^ATTENDEE(?:;.+?)?:(.*)$/gim;
    let attendeeMatch;
    event.attendees = [];
    while ((attendeeMatch = attendeeRegex.exec(eventData)) !== null) {
      event.attendees.push(attendeeMatch[1].trim());
    }
    events.push(event as CalendarEvent);
  }
  return events;
};

// Timezone utilities
export const getTimezoneOffset = (timezone: string): number => {
  try {
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const targetTime = new Date(utc + 0 * 60000);
    const targetOffset = targetTime.toLocaleString('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });

    // Extract offset from timezone string
    const offsetMatch = targetOffset.match(/GMT([+-]\d{1,2}):?(\d{2})?/);
    if (offsetMatch) {
      const hours = parseInt(offsetMatch[1]);
      const minutes = offsetMatch[2] ? parseInt(offsetMatch[2]) : 0;
      return hours * 60 + (hours >= 0 ? minutes : -minutes);
    }
    return 0;
  } catch {
    return 0;
  }
};

export const formatTimezoneOffset = (offsetMinutes: number): string => {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const hours = Math.abs(Math.floor(offsetMinutes / 60));
  const minutes = Math.abs(offsetMinutes % 60);
  return `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const getTimezoneInfo = (timezone: string): TimezoneInfo => {
  const offsetMinutes = getTimezoneOffset(timezone);
  const offset = formatTimezoneOffset(offsetMinutes);

  return {
    value: timezone,
    label: `${timezone} (${offset})`,
    offset,
  };
};

export const convertToTimezone = (
  dateString: string,
  timezone: string
): string => {
  try {
    // Handle different date formats from backend
    let date: Date;

    if (dateString.includes('T') && dateString.includes('Z')) {
      // ISO format with Z (UTC)
      date = new Date(dateString);
    } else if (dateString.includes('T') && dateString.includes('+')) {
      // ISO format with timezone offset
      date = new Date(dateString);
    } else if (dateString.includes(' ')) {
      // Already formatted date string (from backend conversion)
      return dateString;
    } else if (dateString.includes('-')) {
      // Date only format
      date = new Date(`${dateString}T00:00:00Z`);
    } else {
      // Fallback
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }

    // Format the date in the target timezone
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (error) {
    console.error('Error converting timezone:', error, 'for date:', dateString);
    return dateString;
  }
};

export const formatDateForAPI = (date: Date, timezone: string): string => {
  try {
    return date
      .toLocaleString('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(',', '');
  } catch {
    return date.toISOString();
  }
};

// Common timezones list
export const COMMON_TIMEZONES: TimezoneInfo[] = [
  {
    value: 'Asia/Bangkok',
    label: 'Asia/Bangkok (GMT+07:00)',
    offset: 'GMT+07:00',
  },
  {
    value: 'Asia/Ho_Chi_Minh',
    label: 'Asia/Ho_Chi_Minh (GMT+07:00)',
    offset: 'GMT+07:00',
  },
  {
    value: 'Asia/Jakarta',
    label: 'Asia/Jakarta (GMT+07:00)',
    offset: 'GMT+07:00',
  },
  {
    value: 'Asia/Shanghai',
    label: 'Asia/Shanghai (GMT+08:00)',
    offset: 'GMT+08:00',
  },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+09:00)', offset: 'GMT+09:00' },
  {
    value: 'America/New_York',
    label: 'America/New_York (GMT-05:00)',
    offset: 'GMT-05:00',
  },
  {
    value: 'America/Los_Angeles',
    label: 'America/Los_Angeles (GMT-08:00)',
    offset: 'GMT-08:00',
  },
  {
    value: 'Europe/London',
    label: 'Europe/London (GMT+00:00)',
    offset: 'GMT+00:00',
  },
  {
    value: 'Europe/Paris',
    label: 'Europe/Paris (GMT+01:00)',
    offset: 'GMT+01:00',
  },
  { value: 'UTC', label: 'UTC (GMT+00:00)', offset: 'GMT+00:00' },
];
