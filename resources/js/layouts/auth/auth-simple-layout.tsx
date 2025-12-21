import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { settings } = usePage().props;

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md overflow-hidden">
                                {settings?.app_logo_light ? (
                                    <>
                                        <img
                                            src={`/storage/${settings.app_logo_light}`}
                                            alt="Logo"
                                            className={`w-full h-full object-cover ${settings?.app_logo_dark ? 'dark:hidden' : ''}`}
                                        />
                                        {settings?.app_logo_dark && (
                                            <img
                                                src={`/storage/${settings.app_logo_dark}`}
                                                alt="Logo"
                                                className="w-full h-full object-cover hidden dark:block"
                                            />
                                        )}
                                    </>
                                ) : (
                                    <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-white" />
                                )}
                            </div>
                            <span className="sr-only">{settings?.app_name || title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
