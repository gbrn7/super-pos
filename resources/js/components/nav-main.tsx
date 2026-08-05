import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useAuth } from '@/hooks/use-auth';
import type { NavGroup, NavItem } from '@/types';

function SidebarNavItem({ item }: { item: NavItem }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { hasPermission, hasAnyPermission, hasRole, isSuperAdmin } =
        useAuth();

    const isItemAllowed = (navItem: NavItem): boolean => {
        if (isSuperAdmin()) return true;

        let hasRoleAccess = true;
        if (navItem.role) {
            if (Array.isArray(navItem.role)) {
                hasRoleAccess =
                    navItem.role.length === 0 ||
                    navItem.role.some((r) => hasRole(r));
            } else {
                hasRoleAccess = hasRole(navItem.role);
            }
        }

        let hasPermAccess = true;
        if (navItem.permission) {
            if (Array.isArray(navItem.permission)) {
                hasPermAccess =
                    navItem.permission.length === 0 ||
                    hasAnyPermission(navItem.permission);
            } else {
                hasPermAccess = hasPermission(navItem.permission);
            }
        }

        return hasRoleAccess && hasPermAccess;
    };

    if (!isItemAllowed(item)) {
        return null;
    }

    if (!item.items || item.items.length === 0) {
        if (!item.href) return null;

        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={isCurrentUrl(item.href)}
                    tooltip={{ children: item.title }}
                >
                    <Link href={item.href} prefetch>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    const allowedSubItems = item.items.filter((sub) => isItemAllowed(sub));
    if (allowedSubItems.length === 0) {
        return null;
    }

    const isChildActive = allowedSubItems.some(
        (sub) => sub.href && isCurrentUrl(sub.href),
    );

    return (
        <Collapsible
            asChild
            defaultOpen={isChildActive}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        tooltip={{ children: item.title }}
                        isActive={isChildActive}
                    >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {allowedSubItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={
                                        subItem.href
                                            ? isCurrentUrl(subItem.href)
                                            : false
                                    }
                                >
                                    {subItem.href ? (
                                        <Link href={subItem.href} prefetch>
                                            {subItem.icon && <subItem.icon />}
                                            <span>{subItem.title}</span>
                                        </Link>
                                    ) : (
                                        <span>{subItem.title}</span>
                                    )}
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

export function NavMain({
    items = [],
    groups = [],
}: {
    items?: NavItem[];
    groups?: NavGroup[];
}) {
    const { hasPermission, hasAnyPermission, hasRole, isSuperAdmin } =
        useAuth();

    const isItemAllowed = (navItem: NavItem): boolean => {
        if (isSuperAdmin()) return true;

        let hasRoleAccess = true;
        if (navItem.role) {
            if (Array.isArray(navItem.role)) {
                hasRoleAccess =
                    navItem.role.length === 0 ||
                    navItem.role.some((r) => hasRole(r));
            } else {
                hasRoleAccess = hasRole(navItem.role);
            }
        }

        let hasPermAccess = true;
        if (navItem.permission) {
            if (Array.isArray(navItem.permission)) {
                hasPermAccess =
                    navItem.permission.length === 0 ||
                    hasAnyPermission(navItem.permission);
            } else {
                hasPermAccess = hasPermission(navItem.permission);
            }
        }

        return hasRoleAccess && hasPermAccess;
    };

    const navGroups: NavGroup[] = groups.length > 0 ? groups : [{ items }];

    return (
        <>
            {navGroups.map((group, index) => {
                const visibleItems = group.items.filter((item) => {
                    if (!isItemAllowed(item)) return false;
                    if (item.items && item.items.length > 0) {
                        return item.items.some((sub) => isItemAllowed(sub));
                    }
                    return true;
                });

                if (visibleItems.length === 0) {
                    return null;
                }

                return (
                    <SidebarGroup key={group.title || index} className="px-2 py-1">
                        {group.title && (
                            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        )}
                        <SidebarMenu>
                            {visibleItems.map((item) => (
                                <SidebarNavItem key={item.title} item={item} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                );
            })}
        </>
    );
}
