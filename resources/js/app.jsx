import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'School Management System';

createInertiaApp({
        progress: {
        color:  '#093679ff',
        includeCSS: true,
        // throttle: 200,
        delay: 250,
        showSpinner: true,
        showOnComplete: true,
    },
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob(['./pages/**/*.jsx', './pages/**/*.tsx']);
        // Try to resolve as .jsx first, then .tsx
        // Note: This naive approach assumes .jsx for simplicity if both exist or for consistency
        // Ideally, we check which one exists. resolvePageComponent expects a path that matches a key in pages.
        
        let path = `./pages/${name}.jsx`;
        if (!pages[path]) {
             path = `./pages/${name}.tsx`;
        }
        return resolvePageComponent(path, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    // progress: {
    //     color: '#4B5563',
    //     includeCSS: true,
    //     // throttle: 200,
    //     delay: 0,
    //     showOnComplete: true,
    // },
});

// This will set light / dark mode on load...
initializeTheme();

