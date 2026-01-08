'use client';

import { Bell, Search, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';

export function AppHeader() {
    const { setTheme, theme } = useTheme();

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Search */}
            <div className="relative hidden w-96 md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search bookings, guests, rooms..."
                    className="pl-10"
                />
            </div>

            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-medium text-white">
                                3
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <span className="font-semibold">Notifications</span>
                            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                                Mark all read
                            </Button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
                                <span className="font-medium">New booking request</span>
                                <span className="text-sm text-muted-foreground">
                                    Room 205 booked for Jan 5-8
                                </span>
                                <span className="text-xs text-muted-foreground">2 min ago</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
                                <span className="font-medium">Housekeeping completed</span>
                                <span className="text-sm text-muted-foreground">
                                    Room 101 is now ready
                                </span>
                                <span className="text-xs text-muted-foreground">15 min ago</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
                                <span className="font-medium">Payment received</span>
                                <span className="text-sm text-muted-foreground">
                                    ₦450,000 from Guest John D.
                                </span>
                                <span className="text-xs text-muted-foreground">1 hour ago</span>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
