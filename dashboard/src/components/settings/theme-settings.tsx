"use client"

import { useTheme } from "next-themes"
import { IconMoon, IconSun, IconDeviceDesktop } from "@tabler/icons-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ThemeSettings() {
    const { theme, setTheme } = useTheme()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Theme Preferences</CardTitle>
                <CardDescription>
                    Choose how the admin panel looks to you. Select a single theme or sync with your system preferences.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <RadioGroup
                    value={theme}
                    onValueChange={setTheme}
                    className="grid gap-4"
                >
                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light" className="flex flex-1 items-center gap-3 cursor-pointer font-normal">
                            <IconSun className="h-5 w-5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">Light</p>
                                <p className="text-sm text-muted-foreground">Use light theme</p>
                            </div>
                        </Label>
                    </div>

                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="dark" id="dark" />
                        <Label htmlFor="dark" className="flex flex-1 items-center gap-3 cursor-pointer font-normal">
                            <IconMoon className="h-5 w-5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">Dark</p>
                                <p className="text-sm text-muted-foreground">Use dark theme</p>
                            </div>
                        </Label>
                    </div>

                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="system" id="system" />
                        <Label htmlFor="system" className="flex flex-1 items-center gap-3 cursor-pointer font-normal">
                            <IconDeviceDesktop className="h-5 w-5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">System</p>
                                <p className="text-sm text-muted-foreground">Sync with system settings</p>
                            </div>
                        </Label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
    )
}
