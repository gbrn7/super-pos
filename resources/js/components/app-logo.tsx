import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const sidebar = useSidebar();
    const isCollapsed = sidebar?.state === 'collapsed';

    if (isCollapsed) {
        return (
            <div className="flex items-center justify-center overflow-hidden shrink-0 w-full">
                <img
                    src="/asset/Logo.png"
                    alt="Praktis POS"
                    className="h-8 w-8 object-contain"
                />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-2 overflow-hidden shrink-0 w-full">
            <img
                src="/asset/Logo-with-text-white-bg.png"
                alt="Praktis POS"
                className="h-9 w-auto block dark:hidden object-contain mx-auto"
            />
            <img
                src="/asset/Logo-with-text-dark-bg.png"
                alt="Praktis POS"
                className="h-9 w-auto hidden dark:block object-contain mx-auto"
            />
        </div>
    );
}
