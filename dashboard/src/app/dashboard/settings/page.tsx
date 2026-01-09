import { ThemeSettings } from "@/components/settings/theme-settings"

export default function SettingsPage() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <div>
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-2 lg:col-span-2">
                    <ThemeSettings />
                </div>
            </div>
        </div>
    )
}
