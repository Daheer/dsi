'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Building,
    UserCircle,
    Calendar,
    CreditCard,
    BarChart,
    FileText,
    ClipboardList,
    UtensilsCrossed,
    LogOut,
    ChevronLeft,
    Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/auth-store';
import { NAVIGATION_BY_ROLE, ROLE_LABELS, APP_NAME } from '@/lib/constants';
import { useState } from 'react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutDashboard,
    Users,
    Building,
    UserCircle,
    Calendar,
    CreditCard,
    BarChart,
    FileText,
    ClipboardList,
    UtensilsCrossed,
};

export function AppSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    const navigation = user?.role ? NAVIGATION_BY_ROLE[user.role] : [];

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'relative flex h-screen flex-col border-r bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-all duration-300',
                    collapsed ? 'w-[72px]' : 'w-64'
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
                    {!collapsed && (
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 font-bold text-slate-900">
                                DS
                            </div>
                            <span className="text-sm font-semibold tracking-tight">
                                {APP_NAME}
                            </span>
                        </Link>
                    )}
                    {collapsed && (
                        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 font-bold text-slate-900">
                            DS
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 py-4">
                    <nav className="space-y-1 px-3">
                        {navigation.map((item) => {
                            const Icon = iconMap[item.icon] || LayoutDashboard;
                            const isActive = pathname === item.href;

                            const navItem = (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                        isActive
                                            ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'h-5 w-5 shrink-0 transition-colors',
                                            isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-white'
                                        )}
                                    />
                                    {!collapsed && <span>{item.title}</span>}
                                </Link>
                            );

                            if (collapsed) {
                                return (
                                    <Tooltip key={item.href}>
                                        <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                                        <TooltipContent side="right" className="font-medium">
                                            {item.title}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return navItem;
                        })}
                    </nav>
                </ScrollArea>

                <Separator className="bg-slate-800" />

                {/* User section */}
                <div className="p-3">
                    <div
                        className={cn(
                            'flex items-center gap-3 rounded-lg bg-slate-800/50 p-3',
                            collapsed && 'justify-center p-2'
                        )}
                    >
                        <Avatar className="h-9 w-9 border border-slate-700">
                            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-medium text-slate-900">
                                {user ? getInitials(user.full_name) : 'U'}
                            </AvatarFallback>
                        </Avatar>
                        {!collapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium text-white">
                                    {user?.full_name}
                                </p>
                                <p className="truncate text-xs text-slate-400">
                                    {user?.role ? ROLE_LABELS[user.role] : 'User'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className={cn('mt-2 flex gap-2', collapsed && 'flex-col')}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-full text-slate-400 hover:bg-slate-800 hover:text-white"
                                    onClick={logout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    {!collapsed && <span className="ml-2">Logout</span>}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Logout</TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Collapse button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronLeft
                        className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
                    />
                </Button>
            </aside>
        </TooltipProvider>
    );
}
