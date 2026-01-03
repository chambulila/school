
import { usePage } from '@inertiajs/react'
export function can(permission) {
    const { props } = usePage();
    const permissions = props?.auth?.can ?? [];

    return permissions.includes(permission);
}

export function canAny(requiredPermissions = []) {
    const { props } = usePage();
    const userPermissions = props?.auth?.can ?? [];

    if (!Array.isArray(requiredPermissions)) {
        requiredPermissions = [requiredPermissions];
    }

    return requiredPermissions.some(permission =>
        userPermissions.includes(permission)
    );
}


