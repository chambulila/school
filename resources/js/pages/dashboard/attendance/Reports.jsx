import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';

export default function AttendanceReportsPage() {
    const { props } = usePage();
    const [date, setDate] = useState(props.date || new Date().toISOString().substring(0, 10));
    const teacher = props.teacher || {};
    const studentDaily = props.studentDaily || {};
    const studentSession = props.studentSession || {};

    const reload = () => {
        router.get('/dashboard/attendances/reports', { date }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const summary = (obj) => {
        const total = Object.values(obj).reduce((a, b) => a + (b || 0), 0);
        const pct = (v) => total > 0 ? Math.round((v || 0) * 1000 / total) / 10 : 0;
        return { total, pctPresent: pct(obj.present) };
    };

    const teacherSum = summary(teacher);
    const studentDailySum = summary(studentDaily);
    const studentSessionSum = summary(studentSession);

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Attendance Reports', href: '/dashboard/attendances/reports' }]}>
            <Head title="Attendance Reports" />
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
                    <button className="px-3 py-2 border rounded" onClick={reload}>Load</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded p-4">
                        <div className="font-medium mb-2">Teacher Daily</div>
                        <div>Total: {teacherSum.total}</div>
                        <div>Present: {teacher.present || 0}</div>
                        <div>Absent: {teacher.absent || 0}</div>
                        <div>Late: {teacher.late || 0}</div>
                        <div>Excused: {teacher.excused || 0}</div>
                        <div className="mt-2 text-sm text-gray-600">Present %: {teacherSum.pctPresent}%</div>
                    </div>
                    <div className="border rounded p-4">
                        <div className="font-medium mb-2">Student Daily</div>
                        <div>Total: {studentDailySum.total}</div>
                        <div>Present: {studentDaily.present || 0}</div>
                        <div>Absent: {studentDaily.absent || 0}</div>
                        <div>Late: {studentDaily.late || 0}</div>
                        <div>Excused: {studentDaily.excused || 0}</div>
                        <div className="mt-2 text-sm text-gray-600">Present %: {studentDailySum.pctPresent}%</div>
                    </div>
                    <div className="border rounded p-4">
                        <div className="font-medium mb-2">Student Session</div>
                        <div>Total: {studentSessionSum.total}</div>
                        <div>Present: {studentSession.present || 0}</div>
                        <div>Absent: {studentSession.absent || 0}</div>
                        <div>Late: {studentSession.late || 0}</div>
                        <div>Excused: {studentSession.excused || 0}</div>
                        <div className="mt-2 text-sm text-gray-600">Present %: {studentSessionSum.pctPresent}%</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

