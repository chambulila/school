import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

export default function usePermission() {
    const { auth } = usePage().props;

    // Memoize the permissions for better performance
    const permissions = useMemo(() => {
        return auth?.can || [];
    }, [auth?.can]);

    const can = (permission) => {
        return permissions.includes(permission);
    };

    const hasAny = (permissionList) => {
        return permissionList.some(permission => permissions.includes(permission));
    };

    const hasAll = (permissionList) => {
        return permissionList.every(permission => permissions.includes(permission));
    };

    return {
        can,
        hasAny,
        hasAll,
        permissions
    };
}
