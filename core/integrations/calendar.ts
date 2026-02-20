/**
 * Calendar Integration
 * Sync with system calendar for smart context suggestions
 */

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  location?: string;
  contextId?: string;
}

interface CalendarConfig {
  enabled: boolean;
  autoSwitchContexts: boolean;
  preMeetingMinutes: number;
  postMeetingMinutes: number;
}

const DEFAULT_CONFIG: CalendarConfig = {
  enabled: true,
  autoSwitchContexts: false,
  preMeetingMinutes: 5,
  postMeetingMinutes: 2
};

class CalendarIntegration {
  private config: CalendarConfig;
  private events: CalendarEvent[] = [];
  private currentEvent: CalendarEvent | null = null;

  constructor(config: Partial<CalendarConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async sync(): Promise<CalendarEvent[]> {
    console.log('[Calendar] Syncing events...');
    this.events = await this.fetchCalendarEvents();
    this.checkUpcomingEvents();
    return this.events;
  }

  private async fetchCalendarEvents(): Promise<CalendarEvent[]> {
    return [];
  }

  private checkUpcomingEvents(): void {
    const now = new Date();
    const lookahead = new Date(now.getTime() + 15 * 60 * 1000);

    const upcoming = this.events.filter(event => {
      return event.startTime > now && event.startTime <= lookahead;
    });

    upcoming.forEach(event => {
      const minutesUntil = Math.floor((event.startTime.getTime() - now.getTime()) / 60000);
      console.log(`[Calendar] Upcoming: "${event.title}" in ${minutesUntil} minutes`);
    });
  }

  getCurrentEvent(): CalendarEvent | null {
    const now = new Date();
    this.currentEvent = this.events.find(event => {
      return event.startTime <= now && event.endTime >= now;
    }) || null;
    return this.currentEvent;
  }

  getNextEvent(): CalendarEvent | null {
    const now = new Date();
    const futureEvents = this.events
      .filter(e => e.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    return futureEvents[0] || null;
  }

  updateConfig(config: Partial<CalendarConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const calendarIntegration = new CalendarIntegration();
export { CalendarEvent, CalendarConfig };
