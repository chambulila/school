import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AuthenticatedLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

function AuthenticatedLayout({ children, breadcrumbs, ...props }: AuthenticatedLayoutProps) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
}

export default AuthenticatedLayout;

