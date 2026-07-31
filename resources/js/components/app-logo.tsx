export default function AppLogo() {
    return (
        <>
            {/* Icon-only mode (collapsed sidebar) */}
            <div className="flex aspect-square size-10 items-center justify-center rounded-md overflow-hidden flex-shrink-0">
                <img
                    src="/asset/Logo.png"
                    alt="Praktis POS"
                    className="size-10 object-contain"
                />
            </div>

            {/* Expanded mode: logo + text */}
            <div className="ml-2 grid flex-1 text-left leading-tight">
                <span className="truncate text-base font-extrabold tracking-wider text-sidebar-foreground">
                    PRAKTIS{' '}
                    <span className="text-orange-500">POS</span>
                </span>
            </div>
        </>
    );
}
