import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, EventHandler, MouseEvent, MouseEventHandler, useState } from 'react';
import i18next from 'i18next';


interface languageSwitcher {
    value: string,
    label: string
}

const languages: languageSwitcher[] = [
    { value: "id", label: "Indonesia" },
    { value: "en", label: "English" },
]

export default function Appearance() {
    const lang = localStorage.getItem('lang') || 'en';

    const { i18n, t } = useTranslation();

    const defaultLang = languages.find(l => l.value === lang) || languages[0];

    const [languageSelect, setLanguageSelect] = useState<languageSwitcher>(defaultLang);

    const changeLanguage = (value: string) => {
        const selected = languages.find((lang) => lang.value === value);

        if (!selected) return;

        setLanguageSelect(selected);
        i18n.changeLanguage(selected.value);
        localStorage.setItem('lang', selected.value);
    };

    return (
        <>
            <Head title={t("page.settings.appearance.title", "Pengaturan penampilan")} />

            <h1 className="sr-only">{t("page.settings.appearance.title", "Pengaturan penampilan")}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t("page.settings.appearance.title", "Pengaturan penampilan")}
                    description={t("page.settings.appearance.description", "Perbarui pengaturan tampilan akun Anda")}
                />
                <AppearanceTabs />
                <div className='flex flex-col gap-2'>
                    <label htmlFor="name" className="text-sm">{t("page.settings.appearance.language_label", "Bahasa")}
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

Appearance.layout = {
    breadcrumbs: [
        {
            title: i18next.t("page.settings.appearance.title", "Pengaturan penampilan"),
            href: editAppearance(),
        },
    ],
};
