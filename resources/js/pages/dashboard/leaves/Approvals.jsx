import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { askConfirmation } from '@/utils/sweetAlerts';

export default function LeaveApprovalsPage() {
    const { props } = usePage();
    const requests = useMemo(() => props.requests || [], [props.requests]);
    const filters = props.filters || {};
    const [applicantType, setApplicantType] = useState(filters.applicant_type || 'all');

    const reload = () => {
        const params = {};
        if (applicantType !== 'all') params.applicant_type = applicantType;
        router.get('/dashboard/leaves/approvals', params, { preserveState: true, preserveScroll: true });
    };

    const approve = async (row) => {
        const ok = await askConfirmation('Approve this leave?');
        if (!ok) return;
        router.post(`/dashboard/leaves/${row.id}/approve`, {}, { preserveState: true, preserveScroll: true });
    };
    const reject = async (row) => {
        const ok = await askConfirmation('Reject this leave?');
        if (!ok) return;
        const comment = prompt('Enter rejection comment');
        if (!comment) return;
        router.post(`/dashboard/leaves/${row.id}/reject`, { comment }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Leave Approvals', href: '/dashboard/leaves/approvals' }]}>
            <Head title="Leave Approvals" />
            <div className="p-6 space-y-6">
                <div className="border rounded p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Applicant Type</label>
                            <Select value={applicantType} onValueChange={setApplicantType}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button variant="outline" onClick={reload}>Load</Button>
                        </div>
                    </div>
                </div>
                <div className="border rounded p-4 bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Applicant</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(requests.data ?? requests).map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.applicant_type}</TableCell>
                                    <TableCell>{row.leave_type_id}</TableCell>
                                    <TableCell>{row.start_date} → {row.end_date}</TableCell>
                                    <TableCell>{row.total_days}</TableCell>
                                    <TableCell>{row.reason}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button onClick={() => approve(row)}>Approve</Button>
                                        <Button variant="destructive" onClick={() => reject(row)}>Reject</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

