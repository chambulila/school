import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentAttendanceSelectorPage() {
    const { props } = usePage();
    const initialDate = props.date || new Date().toISOString().substring(0, 10);
    const classSections = useMemo(() => props.classSections || [], [props.classSections]);
    const subjects = useMemo(() => props.subjects || [], [props.subjects]);
    const [date, setDate] = useState(initialDate);
    const [mode, setMode] = useState('daily');
    const [sectionId, setSectionId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [period, setPeriod] = useState('');

    const go = () => {
        if (mode === 'daily') {
            router.get('/dashboard/attendances/students/daily', { date, class_section_id: sectionId }, { preserveState: true, preserveScroll: true });
        } else {
            router.get('/dashboard/attendances/students/session', { date, class_section_id: sectionId, subject_id: subjectId, period }, { preserveState: true, preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Students Attendance', href: '/dashboard/attendances/students' }]}>
            <Head title="Students Attendance" />
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded p-4">
                        <div className="font-medium mb-3">Recording Type</div>
                        <Select value={mode} onValueChange={setMode}>
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily Attendance</SelectItem>
                                <SelectItem value="session">Subject/Session Attendance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="border rounded p-4">
                        <div className="font-medium mb-3">Date</div>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
                    </div>
                </div>
                <div className="border rounded p-4 space-y-4">
                    <div>
                        <div className="font-medium mb-2">Class Section</div>
                        <Select value={sectionId} onValueChange={setSectionId}>
                            <SelectTrigger className="w-72">
                                <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                            <SelectContent>
                                {classSections.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.grade?.grade_name ? `${s.grade.grade_name} - ${s.section_name}` : s.section_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {mode === 'session' && (
                        <>
                            <div>
                                <div className="font-medium mb-2">Subject</div>
                                <Select value={subjectId} onValueChange={setSubjectId}>
                                    <SelectTrigger className="w-72">
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(sub => (
                                            <SelectItem key={sub.id} value={sub.id}>{sub.subject_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <div className="font-medium mb-2">Period (optional)</div>
                                <Input value={period} onChange={(e) => setPeriod(e.target.value)} className="w-72" placeholder="e.g., P1" />
                            </div>
                        </>
                    )}
                </div>
                <div>
                    <Button onClick={go} disabled={!sectionId || (mode === 'session' && !subjectId)}>
                        {mode === 'daily' ? 'Open Daily Attendance' : 'Open Session Attendance'}
                    </Button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

