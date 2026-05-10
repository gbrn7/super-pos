import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from "@/locales/en/translation.json"
import id from "@/locales/id/translation.json"
import { languageCode, LanguageSystem, localStorageKey } from '@/constants/Index'


i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      id: {
        translation: id
      },
    },
    lng: LanguageSystem,
    returnEmptyString: false,
    fallbackLng: 'id',
    defaultNS: 'translation'
  })

export default i18next