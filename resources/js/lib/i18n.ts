import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from "@/locales/en/translation.json"
import id from "@/locales/id/translation.json"

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
    lng: localStorage.getItem('lang') || 'id',
    returnEmptyString: false,
    fallbackLng: 'id',
    defaultNS: 'translation'
  })

export default i18next