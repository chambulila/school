import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { askConfirmation } from '@/utils/sweetAlerts';

export default function TeacherDailyAttendancePage() {
    const { props } = usePage();
    const initialDate = props.date || new Date().toISOString().substring(0, 10);
    const initialRecords = useMemo(() => props.records || [], [props.records]);
    const [date, setDate] = useState(initialDate);
    const [records, setRecords] = useState(initialRecords);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setRecords(initialRecords);
    }, [initialRecords]);

    const statuses = ['Present', 'Absent', 'Late', 'Excused'];

    const changeStatus = (teacher_id, status) => {
        setRecords(prev => prev.map(r => r.teacher_id === teacher_id ? { ...r, status } : r));
    };
    const changeRemarks = (teacher_id, remarks) => {
        setRecords(prev => prev.map(r => r.teacher_id === teacher_id ? { ...r, remarks } : r));
    };

    const reload = () => {
        router.get('/dashboard/attendances/teachers', { date }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const save = async () => {
        if (saving) return;
        const confirmed = await askConfirmation('Save attendance?');
        if (!confirmed) return;
        setSaving(true);
        router.post('/dashboard/attendances/teachers', {
            date,
            records: records.map(r => ({ teacher_id: r.teacher_id, status: r.status, remarks: r.remarks || '' }))
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setSaving(false)
        });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Teacher Attendance', href: '/dashboard/attendances/teachers' }]}>
            <Head title="Teacher Daily Attendance" />
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
                    <Button variant="outline" onClick={reload}>Load</Button>
                    <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                </div>
                <div className="border rounded-md bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(records || []).map((row) => (
                                <TableRow key={row.teacher_id}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>
                                        <Select value={row.status} onValueChange={(v) => changeStatus(row.teacher_id, v)}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input value={row.remarks || ''} onChange={(e) => changeRemarks(row.teacher_id, e.target.value)} />
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

