import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cleanParams } from '@/lib/utils';

export default function AuditLogsPage() {
    const { props } = usePage();
    const logs = useMemo(() => props.logs ?? [], [props.logs]);
    const actionTypes = useMemo(() => props.actionTypes ?? [], [props.actionTypes]);
    const modules = useMemo(() => props.modules ?? [], [props.modules]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [queryParams, setQueryParams] = useState({
        search: initialFilters.search || '',
        perPage: initialFilters.perPage || 20,
        action: initialFilters.action || '',
        module: initialFilters.module || '',
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || ''
    });
    const isMounted = useRef(false);
    const prevParamsString = useRef(JSON.stringify(queryParams));

    useEffect(() => {
        const params = cleanParams(queryParams);
        Object.keys(params).forEach(key => {
            if (params[key] === 'all') delete params[key];
        });
        const paramString = JSON.stringify(params);
        if (!isMounted.current) {
            isMounted.current = true;
            prevParamsString.current = paramString;
            return;
        }
        if (paramString === prevParamsString.current) return;
        const timeout = setTimeout(() => {
            prevParamsString.current = paramString;
            router.get('/dashboard/audit-logs', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(timeout);
    }, [queryParams]);

    const jsonPreview = (obj) => {
        if (!obj) return '—';
        try {
            const str = JSON.stringify(obj);
            return str.length > 200 ? str.substring(0, 200) + '…' : str;
        } catch (e) {
            return '—';
        }
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Audit Logs', href: '/dashboard/audit-logs' }]}>
            <Head title="Audit Logs" />
            <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Input className="w-64" value={queryParams.search} onChange={(e) => setQueryParams({ ...queryParams, search: e.target.value })} placeholder="Search by user, action, entity, module…" />
                    <Select value={String(queryParams.perPage)} onValueChange={(v) => setQueryParams({ ...queryParams, perPage: Number(v) })}>
                        <SelectTrigger className="w-28"><SelectValue placeholder="Per Page" /></SelectTrigger>
                        <SelectContent>
                            {[10,20,50,100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={queryParams.action} onValueChange={(v) => setQueryParams({ ...queryParams, action: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="All Actions" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            {actionTypes.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={queryParams.module} onValueChange={(v) => setQueryParams({ ...queryParams, module: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="All Modules" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Modules</SelectItem>
                            {modules.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input type="date" className="w-40" value={queryParams.date_from} onChange={(e) => setQueryParams({ ...queryParams, date_from: e.target.value })} />
                    <Input type="date" className="w-40" value={queryParams.date_to} onChange={(e) => setQueryParams({ ...queryParams, date_to: e.target.value })} />
                </div>
                <div className="border rounded-md bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead></TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Module</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Old Value</TableHead>
                                <TableHead>New Value</TableHead>
                                <TableHead>IP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(logs.data ?? logs).map((row, index) => (
                                <TableRow key={row.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{row.created_at?.substring(0, 19)?.replace('T', ' ') || ''}</TableCell>
                                    <TableCell>{row.user_name || 'System'}</TableCell>
                                    <TableCell>{row.role || '—'}</TableCell>
                                    <TableCell>{row.action_type}</TableCell>
                                    <TableCell>{row.entity_name} ({row.entity_id})</TableCell>
                                    <TableCell>{row.module || '—'}</TableCell>
                                    <TableCell>{row.category || '—'}</TableCell>
                                    <TableCell><pre className="whitespace-pre-wrap text-xs">{jsonPreview(row.old_value)}</pre></TableCell>
                                    <TableCell><pre className="whitespace-pre-wrap text-xs">{jsonPreview(row.new_value)}</pre></TableCell>
                                    <TableCell>{row.ip_address || '—'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {logs.links && (
                    <div className="mt-4">
                        <Pagination links={logs.links} filters={cleanParams(queryParams)} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

