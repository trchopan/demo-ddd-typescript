import {createI18n} from 'vue-i18n'
import en from '@/languages/en.json'

export const i18nPlugin = createI18n({
  locale: 'en',
  allowComposition: true,
  globalInjection: true,
  messages: {
    en,
  },
})
