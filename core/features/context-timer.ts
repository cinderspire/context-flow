/**
 * Context Timer Feature
 * Pomodoro-style timer and analytics for contexts
 */

interface TimerSession {
  contextId: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  interrupted: boolean;
}

interface DailyStats {
  date: string;
  totalTime: number;
  sessions: TimerSession[];
  contextBreakdown: Map<string, number>;
}

class ContextTimerManager {
  private currentSession: TimerSession | null = null;
  private sessions: TimerSession[] = [];
  private dailyGoalMinutes: number = 360; // 6 hours default
  private isPaused: boolean = false;
  private pauseStartTime: number = 0;

  startSession(contextId: string): void {
    if (this.currentSession) {
      this.endSession();
    }

    this.currentSession = {
      contextId,
      startTime: Date.now(),
      duration: 0,
      interrupted: false
    };

    console.log(`[Timer] Started session for ${contextId}`);
  }

  endSession(interrupted: boolean = false): TimerSession | null {
    if (!this.currentSession) return null;

    const now = Date.now();
    this.currentSession.endTime = now;
    this.currentSession.duration = (now - this.currentSession.startTime) / 1000;
    this.currentSession.interrupted = interrupted;

    this.sessions.push({ ...this.currentSession });
    
    console.log(`[Timer] Ended session: ${this.formatDuration(this.currentSession.duration)}`);

    const session = this.currentSession;
    this.currentSession = null;
    
    return session;
  }

  pauseSession(): void {
    if (!this.currentSession || this.isPaused) return;
    
    this.isPaused = true;
    this.pauseStartTime = Date.now();
    console.log('[Timer] Paused');
  }

  resumeSession(): void {
    if (!this.currentSession || !this.isPaused) return;

    const pauseDuration = Date.now() - this.pauseStartTime;
    this.currentSession.startTime += pauseDuration;
    this.isPaused = false;
    
    console.log('[Timer] Resumed');
  }

  getCurrentSessionDuration(): number {
    if (!this.currentSession) return 0;
    if (this.isPaused) {
      return (this.pauseStartTime - this.currentSession.startTime) / 1000;
    }
    return (Date.now() - this.currentSession.startTime) / 1000;
  }

  getCurrentSession(): TimerSession | null {
    return this.currentSession;
  }

  isRunning(): boolean {
    return this.currentSession !== null && !this.isPaused;
  }

  isPaused(): boolean {
    return this.isPaused;
  }

  // Analytics

  getTotalTimeForContext(contextId: string, days: number = 7): number {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    return this.sessions
      .filter(s => s.contextId === contextId && s.startTime >= cutoff)
      .reduce((total, s) => total + s.duration, 0);
  }

  getDailyStats(date: Date = new Date()): DailyStats {
    const dateStr = date.toISOString().split('T')[0];
    const dayStart = new Date(dateStr).getTime();
    const dayEnd = dayStart + (24 * 60 * 60 * 1000);

    const daySessions = this.sessions.filter(
      s => s.startTime >= dayStart && s.startTime < dayEnd
    );

    const totalTime = daySessions.reduce((sum, s) => sum + s.duration, 0);
    
    const contextBreakdown = new Map<string, number>();
    daySessions.forEach(session => {
      const current = contextBreakdown.get(session.contextId) || 0;
      contextBreakdown.set(session.contextId, current + session.duration);
    });

    return {
      date: dateStr,
      totalTime,
      sessions: daySessions,
      contextBreakdown
    };
  }

  getMostProductiveContext(days: number = 7): { contextId: string; time: number } | null {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const contextTimes = new Map<string, number>();

    this.sessions
      .filter(s => s.startTime >= cutoff)
      .forEach(s => {
        const current = contextTimes.get(s.contextId) || 0;
        contextTimes.set(s.contextId, current + s.duration);
      });

    let maxTime = 0;
    let maxContext: string | null = null;

    contextTimes.forEach((time, contextId) => {
      if (time > maxTime) {
        maxTime = time;
        maxContext = contextId;
      }
    });

    return maxContext ? { contextId: maxContext, time: maxTime } : null;
  }

  getWeeklyReport(): { day: string; hours: number }[] {
    const report: { day: string; hours: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const stats = this.getDailyStats(date);
      
      report.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Math.round((stats.totalTime / 3600) * 10) / 10
      });
    }

    return report;
  }

  setDailyGoal(minutes: number): void {
    this.dailyGoalMinutes = minutes;
  }

  getDailyGoalProgress(): { current: number; goal: number; percentage: number } {
    const today = this.getDailyStats();
    const current = today.totalTime / 60; // in minutes
    
    return {
      current: Math.round(current),
      goal: this.dailyGoalMinutes,
      percentage: Math.min(100, Math.round((current / this.dailyGoalMinutes) * 100))
    };
  }

  // Pomodoro

  startPomodoro(contextId: string, durationMinutes: number = 25): void {
    this.startSession(contextId);
    
    setTimeout(() => {
      this.endSession();
      this.notifyPomodoroComplete();
    }, durationMinutes * 60 * 1000);
  }

  private notifyPomodoroComplete(): void {
    console.log('[Timer] Pomodoro complete! Take a break.');
    // Could trigger notification
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Persistence

  saveSessions(): void {
    // Save to database
    console.log(`[Timer] Saved ${this.sessions.length} sessions`);
  }

  loadSessions(): void {
    // Load from database
    console.log('[Timer] Loaded sessions');
  }
}

export const timerManager = new ContextTimerManager();
export { TimerSession, DailyStats };
