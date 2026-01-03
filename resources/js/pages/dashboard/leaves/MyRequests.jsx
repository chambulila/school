import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Pagination from '@/components/ui/pagination';
import { askConfirmation } from '@/utils/sweetAlerts';

export default function MyLeaveRequestsPage() {
    const { props } = usePage();
    const requests = useMemo(() => props.requests || [], [props.requests]);
    const types = useMemo(() => props.types || [], [props.types]);
    const applicantType = props.applicantType || 'student';
    const [leaveTypeId, setLeaveTypeId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [attachmentPath, setAttachmentPath] = useState('');

    const submit = async () => {
        const confirmed = await askConfirmation('Submit leave request?');
        if (!confirmed) return;
        router.post('/dashboard/leaves/apply', {
            applicant_type: applicantType,
            leave_type_id: leaveTypeId,
            start_date: startDate,
            end_date: endDate,
            reason,
            attachment_path: attachmentPath || null,
        }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'My Leaves', href: '/dashboard/leaves/my' }]}>
            <Head title="My Leave Requests" />
            <div className="p-6 space-y-6">
                <div className="border rounded p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Leave Type</label>
                            <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select leave type" /></SelectTrigger>
                                <SelectContent>
                                    {types.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Reason</label>
                            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Attachment Path (optional)</label>
                            <Input value={attachmentPath} onChange={(e) => setAttachmentPath(e.target.value)} placeholder="e.g., /storage/leaves/abc.pdf" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button onClick={submit} disabled={!leaveTypeId || !startDate || !endDate || !reason}>Submit</Button>
                    </div>
                </div>
                <div className="border rounded p-4 bg-white">
                    <div className="font-medium mb-2">My Requests</div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Total Days</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(requests.data ?? requests).map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.created_at?.substring(0, 10)}</TableCell>
                                    <TableCell>{types.find(t => t.id === row.leave_type_id)?.name || '—'}</TableCell>
                                    <TableCell>{row.start_date} → {row.end_date}</TableCell>
                                    <TableCell>{row.total_days}</TableCell>
                                    <TableCell>{row.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {requests.links && (
                        <div className="mt-4">
                            <Pagination links={requests.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

