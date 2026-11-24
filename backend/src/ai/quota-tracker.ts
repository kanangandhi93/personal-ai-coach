import { FreeAIProvider, AIUsageRecord } from '@coach/shared';
import { FREE_PROVIDER_CAPABILITIES } from '../config';
import { getSupabaseServiceClient } from '../db/supabase';

interface MinuteCounter {
  minuteTimestamp: number;
  requestCount: number;
}

interface DayCounter {
  dayString: string;
  requestCount: number;
  totalTokens: number;
}

export class QuotaTracker {
  private minuteCounters: Map<FreeAIProvider, MinuteCounter> = new Map();
  private dayCounters: Map<FreeAIProvider, DayCounter> = new Map();

  private getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private getCurrentMinuteTimestamp(): number {
    return Math.floor(Date.now() / 60000);
  }

  public canMakeRequest(provider: FreeAIProvider): { allowed: boolean; reason?: string } {
    const caps = FREE_PROVIDER_CAPABILITIES[provider];
    if (!caps) {
      return { allowed: false, reason: `Unknown provider ${provider}` };
    }

    const currentMinute = this.getCurrentMinuteTimestamp();
    const today = this.getTodayString();

    const minCounter = this.minuteCounters.get(provider);
    if (minCounter && minCounter.minuteTimestamp === currentMinute) {
      if (minCounter.requestCount >= caps.requestsPerMinuteLimit) {
        return {
          allowed: false,
          reason: `Free tier rate limit reached: ${caps.requestsPerMinuteLimit} requests/min on ${provider}`
        };
      }
    }

    const dayCounter = this.dayCounters.get(provider);
    if (dayCounter && dayCounter.dayString === today) {
      if (dayCounter.requestCount >= caps.requestsPerDayLimit) {
        return {
          allowed: false,
          reason: `Free tier daily quota exhausted: ${caps.requestsPerDayLimit} requests/day on ${provider}`
        };
      }
    }

    return { allowed: true };
  }

  public recordUsage(record: AIUsageRecord): void {
    const provider = record.provider;
    const currentMinute = this.getCurrentMinuteTimestamp();
    const today = this.getTodayString();

    // Update minute counter
    const minCounter = this.minuteCounters.get(provider);
    if (minCounter && minCounter.minuteTimestamp === currentMinute) {
      minCounter.requestCount += 1;
    } else {
      this.minuteCounters.set(provider, {
        minuteTimestamp: currentMinute,
        requestCount: 1
      });
    }

    // Update day counter
    const dayCounter = this.dayCounters.get(provider);
    if (dayCounter && dayCounter.dayString === today) {
      dayCounter.requestCount += 1;
      dayCounter.totalTokens += record.totalTokens;
    } else {
      this.dayCounters.set(provider, {
        dayString: today,
        requestCount: 1,
        totalTokens: record.totalTokens
      });
    }

    // Asynchronously log to Supabase ai_usage table if available without blocking
    try {
      const supabase = getSupabaseServiceClient();
      Promise.resolve(
        supabase.from('ai_usage').insert({
          user_id: record.userId,
          provider: record.provider,
          model: record.model,
          prompt_tokens: record.promptTokens,
          completion_tokens: record.completionTokens,
          total_tokens: record.totalTokens,
          duration_ms: record.durationMs,
          success: record.success,
          error_code: record.errorMessage
        })
      ).catch(() => {
        // Silently skip if DB not configured yet or mock
      });
    } catch {
      // Ignore background persistence errors
    }
  }

  public getStatus(provider: FreeAIProvider) {
    const caps = FREE_PROVIDER_CAPABILITIES[provider];
    const today = this.getTodayString();
    const dayCounter = this.dayCounters.get(provider);
    const usedToday = (dayCounter && dayCounter.dayString === today) ? dayCounter.requestCount : 0;
    const tokensToday = (dayCounter && dayCounter.dayString === today) ? dayCounter.totalTokens : 0;

    return {
      provider,
      dailyQuotaLimit: caps.requestsPerDayLimit,
      dailyUsed: usedToday,
      dailyRemaining: Math.max(0, caps.requestsPerDayLimit - usedToday),
      tokensToday
    };
  }
}

export const quotaTracker = new QuotaTracker();
