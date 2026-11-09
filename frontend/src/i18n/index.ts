import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './locales/ru'
import en from './locales/en'

export const LOCALE_STORAGE_KEY = 'flexora.locale'

function readStoredLang(): 'ru' | 'en' {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'en' || stored === 'ru') return stored
  } catch {
    /* private mode */
  }
  return 'ru'
}

const initialLng = readStoredLang()

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLng
}

void i18n.use(initReactI18next).init({
  resources: {
    ru,
    en,
  },
  lng: initialLng,
  fallbackLng: 'ru',
  supportedLngs: ['ru', 'en'],
  ns: ['common', 'nav', 'auth', 'landing', 'topbar', 'pages', 'components'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, lng)
  } catch {
    /* ignore */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng
  }
})

export default i18n
