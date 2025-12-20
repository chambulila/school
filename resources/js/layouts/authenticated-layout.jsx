import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AuthenticatedLayout({ children, breadcrumbs }) {
        const { props } = usePage();
    const flash = props.flash;
    const settings = props.settings;

    useEffect(() => {
        if (settings?.theme_primary_color) {
            const root = document.documentElement;
            const color = settings.theme_primary_color;
            
            // Apply theme color to CSS variables
            // We use the hex color directly. Tailwind 4/Modern CSS handles this well for background-color, etc.
            // Note: Opacity modifiers might behave differently if not using color-mix compatible format,
            // but for main theme colors it usually works.
            root.style.setProperty('--primary', color);
            root.style.setProperty('--ring', color);
            root.style.setProperty('--sidebar-primary', color);
            root.style.setProperty('--sidebar-ring', color);
            
            // Also update sidebar accent to match theme for active states if desired
            // For now we keep the accent as is or maybe link it?
            // If we want the "active" sidebar link to be the theme color:
            // root.style.setProperty('--sidebar-accent', color);
            // root.style.setProperty('--sidebar-accent-foreground', '#ffffff'); // Assuming dark theme color
        }
    }, [settings]);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
        if (flash.info) {
            toast.info(flash.info);
        }
        if (flash.warning) {
            toast.warning(flash.warning);
        }
    }, [flash.success, flash.error, flash.info, flash.warning]);
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            <ToastContainer position="top-right" autoClose={5000} newestOnTop />
            {children}
        </AppLayoutTemplate>
    );
}

export default AuthenticatedLayout;
