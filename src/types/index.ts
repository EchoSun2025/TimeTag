// Core types for TimeTag application

export interface TimeRecord {
  id: string;
  description: string;
  startTime: Date;
  endTime: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActiveRecord {
  id: string;
  description: string;
  startTime: Date;
  tags: string[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  isActive: boolean; // For filtering (gray out when inactive)
  isLeisure: boolean; // Leisure tags don't count in total hours
  subItems: string[]; // Sub-items list for quick selection
  createdAt: Date;
}

export interface Settings {
  timeRounding: boolean; // 15-minute rounding
  roundingInterval: number; // Default 15 minutes
  defaultStartHour: number; // Default 8 (8am)
  defaultEndHour: number; // Default 21 (9pm)
  weekDaysCount: 5 | 7; // 5-day or 7-day week view
}

export interface DayStats {
  date: Date;
  totalMinutes: number;
  tagMinutes: Record<string, number>;
  records: TimeRecord[];
  breaks: BreakPeriod[];
}

export interface BreakPeriod {
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
}

export interface WeekStats {
  startDate: Date;
  endDate: Date;
  totalMinutes: number;
  days: DayStats[];
}

// UI State types
export interface TimelineZoom {
  level: number; // 1-5 scale
  pixelsPerHour: number;
}

export interface DateNavigation {
  currentDate: Date;
  currentWeekStart: Date;
}
