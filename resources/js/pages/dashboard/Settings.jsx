import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SettingsLayout from '@/layouts/settings/layout';
import SaveButton from '@/components/buttons/SaveButton';

const PRESET_COLORS = [
    '#000000', // Black/Gray (Default)
    '#2563eb', // Blue
    '#16a34a', // Green
    '#dc2626', // Red
    '#9333ea', // Purple
    '#ea580c', // Orange
    '#0d9488', // Teal
];

export default function Settings({ settings }) {
    const { data, setData, put, processing, errors } = useForm({
        theme_primary_color: settings.theme_primary_color || '#000000',
    });

    const submit = (e) => {
        e.preventDefault();
        router.put('/dashboard/settings/theme', data, {
            onSuccess: () => {
                // reset();
            },
        });
        // router.put
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Settings', href: '/dashboard/settings/theme' },
                { title: 'System Theme', href: '/dashboard/settings/theme' },
            ]}
        >
            <Head title="General Settings" />
            <SettingsLayout>
                <div className="flex flex-col gap-6 p-4 md:p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Theme Settings</CardTitle>
                            <CardDescription>
                                Customize the appearance of the admin dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="theme_primary_color">Primary Theme Color</Label>
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {PRESET_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`w-10 h-10 rounded-full border-2 transition-all ${data.theme_primary_color === color
                                                        ? 'border-primary ring-2 ring-offset-2 ring-primary'
                                                        : 'border-transparent hover:scale-110'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setData('theme_primary_color', color)}
                                                aria-label={`Select color ${color}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="theme_primary_color"
                                            type="color"
                                            className="w-20 h-10 p-1 cursor-pointer"
                                            value={data.theme_primary_color}
                                            onChange={(e) => setData('theme_primary_color', e.target.value)}
                                        />
                                        <span className="text-sm font-mono text-muted-foreground">
                                            {data.theme_primary_color}
                                        </span>
                                    </div>
                                    {errors.theme_primary_color && (
                                        <p className="text-sm text-destructive">{errors.theme_primary_color}</p>
                                    )}
                                </div>

                                <SaveButton type="submit" disabled={processing}>
                                    Save Changes
                                </SaveButton>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>

        </AuthenticatedLayout>
    );
}
