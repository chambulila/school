import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { settings } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary overflow-hidden text-sidebar-primary-foreground">
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
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>

            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {settings?.app_name || 'SkuliTech'}
                </span>
            </div>
        </>
    );
}
