export interface FaqConfigItem {
  id: string;
  questionKey: string;
  answerKey: string;
}

export const FAQ_CONFIG: FaqConfigItem[] = [
  {
    id: 'getting-started',
    questionKey: 'support.faq.items.gettingStarted.question',
    answerKey: 'support.faq.items.gettingStarted.answer',
  },
  {
    id: 'language-switch',
    questionKey: 'support.faq.items.languageSwitch.question',
    answerKey: 'support.faq.items.languageSwitch.answer',
  },
  {
    id: 'app-lock',
    questionKey: 'support.faq.items.appLock.question',
    answerKey: 'support.faq.items.appLock.answer',
  },
  {
    id: 'contact-team',
    questionKey: 'support.faq.items.contactTeam.question',
    answerKey: 'support.faq.items.contactTeam.answer',
  },
];
