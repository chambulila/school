import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AuthenticatedLayout({ children, breadcrumbs }) {
        const { props } = usePage();
    const flash = props.flash;

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
