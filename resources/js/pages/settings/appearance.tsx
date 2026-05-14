import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';



export default function Appearance() {
    const { t } = useTranslation();


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


// function AppearanceLayout({ children }: { children: React.ReactNode }) {
//     const { t } = useTranslation();

//     return (
//         <AppLayout
//             breadcrumbs={[
//                 {
//                     title: t("page.settings.appearance.title"),
//                     href: editAppearance(),
//                 },
//             ]}
//         >
//             {children}
//         </AppLayout>
//     );
// }

// Appearance.layout = (page: React.ReactNode) => (
//     <AppearanceLayout>{page}</AppearanceLayout>
// );