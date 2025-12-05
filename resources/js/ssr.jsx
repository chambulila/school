import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => {
            const pages = {
                ...import.meta.glob('./pages/**/*.tsx', { eager: true }),
                ...import.meta.glob('./pages/**/*.jsx', { eager: true }),
            };
            const pathTsx = `./pages/${name}.tsx`;
            const pathJsx = `./pages/${name}.jsx`;
            return pages[pathTsx] ?? pages[pathJsx];
        },
        setup: ({ App, props }) => {
            return <App {...props} />;
        },
    }),
);
