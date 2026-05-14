import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { edit as editLanguage } from '@/routes/language';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import i18next from 'i18next';
import { languageCode, localStorageKey } from '@/constants/Index';

interface languageSwitcher {
  value: string,
  label: string
}

const languages: languageSwitcher[] = [
  { value: "id", label: "Indonesia" },
  { value: "en", label: "English" },
]

export default function Language() {
  const lang = localStorage.getItem(localStorageKey.LanguageKey) || languageCode.DefaultLanguageCode;

  const { i18n, t } = useTranslation();

  const defaultLang = languages.find(l => l.value === lang) || languages[0];

  const [languageSelect, setLanguageSelect] = useState<languageSwitcher>(defaultLang);

  const changeLanguage = (value: string) => {
    const selected = languages.find((lang) => lang.value === value);

    if (!selected) return;

    setLanguageSelect(selected);
    i18n.changeLanguage(selected.value);
    localStorage.setItem('lang', selected.value);

    window.location.reload();
  };

  return (
    <>
      <Head title={t("page.settings.language.title", "Pengaturan bahasa")} />

      <h1 className="sr-only">{t("page.settings.language.title", "Pengaturan bahasa")}</h1>

      <div className="space-y-6">
        <Heading
          variant="small"
          title={t("page.settings.language.title", "Pengaturan bahasa")}
          description={t("page.settings.language.description", "Perbarui pengaturan bahasa Anda")}
        />
        <div className='flex flex-col gap-2'>
          <label htmlFor="name" className="text-sm">{t("page.settings.language.language_label", "Bahasa")}
          </label>
          <Select onValueChange={changeLanguage} value={languageSelect.value}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-2">
                    {lang.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div >
    </>
  );
}

Language.layout = {
  breadcrumbs: [
    {
      title: i18next.t("page.settings.language.title", "Pengaturan bahasa"),
      href: editLanguage(),
    },
  ],
};
