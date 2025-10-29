import AsyncStorage from '@react-native-async-storage/async-storage';

import { CONFIG } from '@/core/config';
import { http } from '@/shared/services/api/client';

type RawFaqResponse = FAQItem[] | { data?: FAQItem[]; faqs?: FAQItem[]; items?: FAQItem[] };

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  updatedAt?: string;
}

export interface FaqResult {
  faqs: FAQItem[];
  fromCache: boolean;
  stale: boolean;
  timestamp: number | null;
}

interface CachedState {
  faqs: FAQItem[];
  timestamp: number;
}

class FaqService {
  private static instance: FaqService;

  private memoryCache: FAQItem[] | null = null;
  private memoryTimestamp: number | null = null;

  private readonly fallbackFaqs: FAQItem[] = [
    {
      id: 'fallback-1',
      question: 'How can I reach the Haritage support team?',
      answer: 'Use the call or email actions above to contact us directly. We aim to respond within one business day.',
    },
    {
      id: 'fallback-2',
      question: 'Why are FAQs unavailable right now?',
      answer: 'We are refreshing our help center content. Please try again shortly or reach out via phone or email for immediate assistance.',
    },
  ];

  private constructor() {}

  static getInstance(): FaqService {
    if (!FaqService.instance) {
      FaqService.instance = new FaqService();
    }
    return FaqService.instance;
  }

  async getFaqs(options: { forceRefresh?: boolean } = {}): Promise<FaqResult> {
    const { forceRefresh = false } = options;
    const now = Date.now();
    const ttl = CONFIG.SUPPORT.FAQ_CACHE_MS;

    if (!forceRefresh && this.memoryCache && this.memoryTimestamp) {
      const age = now - this.memoryTimestamp;
      if (age < ttl) {
        return {
          faqs: this.memoryCache,
          fromCache: true,
          stale: false,
          timestamp: this.memoryTimestamp,
        };
      }
    }

    if (!forceRefresh) {
      const cached = await this.readFromStorage();
      if (cached && now - cached.timestamp < ttl) {
        this.memoryCache = cached.faqs;
        this.memoryTimestamp = cached.timestamp;
        return {
          faqs: cached.faqs,
          fromCache: true,
          stale: false,
          timestamp: cached.timestamp,
        };
      }
    }

    try {
      const response = await http.get<RawFaqResponse>('/support/faqs');
  const faqs = this.parseResponse(response);
  const normalizedFaqs = faqs.length ? faqs : this.fallbackFaqs;
  this.memoryCache = normalizedFaqs;
  this.memoryTimestamp = now;
  await this.writeToStorage({ faqs: normalizedFaqs, timestamp: now });

      return {
        faqs: normalizedFaqs,
        fromCache: false,
        stale: false,
        timestamp: now,
      };
    } catch (error) {
      const cached = await this.readFromStorage();
      if (cached) {
        this.memoryCache = cached.faqs;
        this.memoryTimestamp = cached.timestamp;
        return {
          faqs: cached.faqs,
          fromCache: true,
          stale: now - cached.timestamp >= ttl,
          timestamp: cached.timestamp,
        };
      }

      console.warn('Falling back to bundled FAQs', error);
      this.memoryCache = this.fallbackFaqs;
      this.memoryTimestamp = null;
      return {
        faqs: this.fallbackFaqs,
        fromCache: true,
        stale: true,
        timestamp: null,
      };
    }
  }

  async clearCache(): Promise<void> {
    this.memoryCache = null;
    this.memoryTimestamp = null;
    await AsyncStorage.removeItem(CONFIG.STORAGE_KEYS.SUPPORT_FAQ_CACHE);
  }

  private parseResponse(input: RawFaqResponse): FAQItem[] {
    if (Array.isArray(input)) {
      return input;
    }

    if (Array.isArray(input?.faqs)) {
      return input.faqs;
    }

    if (Array.isArray(input?.data)) {
      return input.data;
    }

    if (Array.isArray(input?.items)) {
      return input.items;
    }

    return [];
  }

  private async readFromStorage(): Promise<CachedState | null> {
    try {
      const cached = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.SUPPORT_FAQ_CACHE);
      if (!cached) {
        return null;
      }

      const parsed = JSON.parse(cached) as CachedState;
      if (!Array.isArray(parsed?.faqs) || typeof parsed.timestamp !== 'number') {
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn('Failed to read FAQ cache', error);
      return null;
    }
  }

  private async writeToStorage(state: CachedState): Promise<void> {
    try {
      await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.SUPPORT_FAQ_CACHE, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to write FAQ cache', error);
    }
  }
}

export const faqService = FaqService.getInstance();
