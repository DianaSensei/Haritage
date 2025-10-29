import { FAQ_CONFIG } from '@/modules/support/data/faqConfig';

export interface FAQItem {
  id: string;
  questionKey: string;
  answerKey: string;
}

export interface FaqResult {
  faqs: FAQItem[];
  fromCache: boolean;
  stale: boolean;
  timestamp: number | null;
}

class FaqService {
  private static instance: FaqService;

  private constructor() {}

  static getInstance(): FaqService {
    if (!FaqService.instance) {
      FaqService.instance = new FaqService();
    }
    return FaqService.instance;
  }

  async getFaqs(_options: { forceRefresh?: boolean } = {}): Promise<FaqResult> {
    // The FAQ content is bundled locally, so we ignore external refresh requests.
    return {
      faqs: FAQ_CONFIG,
      fromCache: false,
      stale: false,
      timestamp: null,
    };
  }

  async clearCache(): Promise<void> {
    // No-op: FAQs are bundled locally, so there is nothing to clear.
  }
}

export const faqService = FaqService.getInstance();
