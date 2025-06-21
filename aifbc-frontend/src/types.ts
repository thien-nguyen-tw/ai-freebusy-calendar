export interface CalendarEvent {
  uid: string | null;
  summary: string | null;
  description: string | null;
  location: string | null;
  dtstart: string | null;
  dtend: string | null;
  status: string | null;
  organizer: string | null;
  attendees: string[];
}

export interface ScheduleData {
  available: string[];
  busy: string[];
  bestSlots: string[];
  source: 'ics' | 'image';
  fileName: string;
  choices: string[];
}

export interface ProcessedFile {
  file: File;
  type: 'ics' | 'image';
  data?: CalendarEvent[] | ScheduleData;
}

export type MessageType = 'info' | 'success' | 'warning' | 'danger';

export interface TimezoneInfo {
  value: string;
  label: string;
  offset: string;
}

export interface TimezoneContextType {
  timezone: string;
  setTimezone: (timezone: string) => void;
  timezoneInfo: TimezoneInfo;
}

export interface MessageBoxProps {
  message: string;
  type: MessageType;
  onClear: () => void;
}

export interface FileUploadProps {
  onFilesProcessed: (jsonData: string, scheduleData: ScheduleData[]) => void;
  onMessage: (text: string, type: MessageType) => void;
}

export interface AiAnalysisProps {
  jsonData: string;
  scheduleData?: ScheduleData[];
  onAnalysisStart: () => void;
  onAnalysisComplete: (reportHtml: string) => void;
  onMessage: (text: string, type: MessageType) => void;
}

export interface AiReportProps {
  report: string;
  isLoading: boolean;
}

export interface QuickCalendarProps {
  onMessage: (text: string, type: MessageType) => void;
}

export interface GoogleCalendarProps {
  onMessage: (text: string, type: MessageType) => void;
}

export interface TimezoneSelectorProps {
  onMessage: (text: string, type: MessageType) => void;
}
