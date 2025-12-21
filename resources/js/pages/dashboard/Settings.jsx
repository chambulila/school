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
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        theme_color: settings.theme_color || '#000000',
        app_name: settings.app_name || '',
        app_short_name: settings.app_short_name || '',
        app_logo_light: null,
        app_logo_dark: null,
        app_favicon: null,
    });

    const handleFileChange = (e, field) => {
        setData(field, e.target.files[0]);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/dashboard/settings/theme', {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Settings', href: '/dashboard/settings' },
            ]}
        >
            <Head title="General Settings" />
            <SettingsLayout>
                <div className="flex flex-col gap-6 p-4 md:p-6">
                    {/* Application Branding Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Branding</CardTitle>
                            <CardDescription>
                                Configure the global application name, logos, and favicon.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="app_name">Application Name</Label>
                                        <Input
                                            id="app_name"
                                            value={data.app_name}
                                            onChange={(e) => setData('app_name', e.target.value)}
                                            placeholder="e.g. My School System"
                                        />
                                        {errors.app_name && <p className="text-sm text-destructive">{errors.app_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="app_short_name">Short Name</Label>
                                        <Input
                                            id="app_short_name"
                                            value={data.app_short_name}
                                            onChange={(e) => setData('app_short_name', e.target.value)}
                                            placeholder="e.g. SMS"
                                        />
                                        {errors.app_short_name && <p className="text-sm text-destructive">{errors.app_short_name}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="app_logo_light">Light Logo (Default)</Label>
                                        <Input
                                            id="app_logo_light"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'app_logo_light')}
                                        />
                                        {settings.app_logo_light && (
                                            <div className="mt-2 p-2 bg-gray-100 rounded border">
                                                <img src={`/storage/${settings.app_logo_light}`} alt="Current Light Logo" className="h-12 object-contain" />
                                            </div>
                                        )}
                                        {errors.app_logo_light && <p className="text-sm text-destructive">{errors.app_logo_light}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="app_logo_dark">Dark Logo (Optional)</Label>
                                        <Input
                                            id="app_logo_dark"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'app_logo_dark')}
                                        />
                                         {settings.app_logo_dark && (
                                            <div className="mt-2 p-2 bg-gray-900 rounded border">
                                                <img src={`/storage/${settings.app_logo_dark}`} alt="Current Dark Logo" className="h-12 object-contain" />
                                            </div>
                                        )}
                                        {errors.app_logo_dark && <p className="text-sm text-destructive">{errors.app_logo_dark}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="app_favicon">Favicon (ico/png)</Label>
                                        <Input
                                            id="app_favicon"
                                            type="file"
                                            accept=".ico,.png"
                                            onChange={(e) => handleFileChange(e, 'app_favicon')}
                                        />
                                         {settings.app_favicon && (
                                            <div className="mt-2">
                                                <img src={`/storage/${settings.app_favicon}`} alt="Current Favicon" className="h-8 w-8 object-contain" />
                                            </div>
                                        )}
                                        {errors.app_favicon && <p className="text-sm text-destructive">{errors.app_favicon}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t">
                                    <Label htmlFor="theme_color">Primary Theme Color</Label>
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {PRESET_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`w-10 h-10 rounded-full border-2 transition-all ${data.theme_color === color
                                                        ? 'border-primary ring-2 ring-offset-2 ring-primary'
                                                        : 'border-transparent hover:scale-110'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setData('theme_color', color)}
                                                aria-label={`Select color ${color}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="theme_color"
                                            type="color"
                                            className="w-20 h-10 p-1 cursor-pointer"
                                            value={data.theme_color}
                                            onChange={(e) => setData('theme_color', e.target.value)}
                                        />
                                        <span className="text-sm font-mono text-muted-foreground">
                                            {data.theme_color}
                                        </span>
                                    </div>
                                    {errors.theme_color && (
                                        <p className="text-sm text-destructive">{errors.theme_color}</p>
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
