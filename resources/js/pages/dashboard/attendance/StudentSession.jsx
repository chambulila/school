import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { askConfirmation } from '@/utils/sweetAlerts';

export default function StudentSessionAttendancePage() {
    const { props } = usePage();
    const initialDate = props.date || new Date().toISOString().substring(0, 10);
    const classSections = useMemo(() => props.classSections || [], [props.classSections]);
    const subjects = useMemo(() => props.subjects || [], [props.subjects]);
    const initialSectionId = props.selectedSectionId || '';
    const initialSubjectId = props.selectedSubjectId || '';
    const initialPeriod = props.selectedPeriod || '';
    const initialRecords = useMemo(() => props.records || [], [props.records]);
    const [date, setDate] = useState(initialDate);
    const [sectionId, setSectionId] = useState(initialSectionId);
    const [subjectId, setSubjectId] = useState(initialSubjectId);
    const [period, setPeriod] = useState(initialPeriod);
    const [records, setRecords] = useState(initialRecords);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setRecords(initialRecords);
    }, [initialRecords]);

    const statusOpts = ['Present', 'Absent', 'Late', 'Excused'];

    const changeStatus = (student_id, status) => {
        setRecords(prev => prev.map(r => r.student_id === student_id ? { ...r, status } : r));
    };
    const changeRemarks = (student_id, remarks) => {
        setRecords(prev => prev.map(r => r.student_id === student_id ? { ...r, remarks } : r));
    };

    const reload = () => {
        router.get('/dashboard/attendances/students/session', { date, class_section_id: sectionId, subject_id: subjectId, period }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const save = async () => {
        if (saving || !sectionId || !subjectId) return;
        const confirmed = await askConfirmation('Save attendance?');
        if (!confirmed) return;
        setSaving(true);
        router.post('/dashboard/attendances/students/session', {
            date,
            class_section_id: sectionId,
            subject_id: subjectId,
            period,
            records: records.map(r => ({ student_id: r.student_id, status: r.status, remarks: r.remarks || '' }))
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setSaving(false)
        });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Student Session Attendance', href: '/dashboard/attendances/students/session' }]}>
            <Head title="Student Session Attendance" />
            <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
                    <Select value={sectionId} onValueChange={setSectionId}>
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                            {classSections.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.grade?.grade_name ? `${s.grade.grade_name} - ${s.section_name}` : s.section_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={subjectId} onValueChange={setSubjectId}>
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                            {subjects.map(sub => (
                                <SelectItem key={sub.id} value={sub.id}>{sub.subject_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input value={period} onChange={(e) => setPeriod(e.target.value)} className="w-48" placeholder="Period (optional)" />
                    <Button variant="outline" onClick={reload}>Load</Button>
                    <Button onClick={save} disabled={saving || !sectionId || !subjectId}>{saving ? 'Saving...' : 'Save'}</Button>
                </div>
                <div className="border rounded-md bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Admission</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(records || []).map((row) => (
                                <TableRow key={row.student_id}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.admission_number}</TableCell>
                                    <TableCell>
                                        <Select value={row.status} onValueChange={(v) => changeStatus(row.student_id, v)}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOpts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input value={row.remarks || ''} onChange={(e) => changeRemarks(row.student_id, e.target.value)} />
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

