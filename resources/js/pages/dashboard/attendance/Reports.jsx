import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Pagination from '@/components/ui/pagination';
import { cleanParams } from '@/lib/utils';
import { can } from '@/hooks/usePermission';

export default function AttendanceReportsPage() {
    const { props } = usePage();
    const classSections = useMemo(() => props.classSections || [], [props.classSections]);
    const subjects = useMemo(() => props.subjects || [], [props.subjects]);
    const listing = useMemo(() => props.listing || [], [props.listing]);
    const teacherSummary = props.teacherSummary || {};
    const studentDailySummary = props.studentDailySummary || {};
    const studentSessionSummary = props.studentSessionSummary || {};
    const initialFilters = props.filters || {};
    const canViewTeacher = can('view-teachers-attendances');
    const canViewStudent = can('view-students-attendances');
    const allowedTypes = useMemo(() => {
        const t = [];
        if (canViewTeacher) t.push('teacher');
        if (canViewStudent) {
            t.push('student_daily');
            t.push('student_session');
        }
        return t;
    }, [canViewTeacher, canViewStudent]);
    const initialType = (initialFilters.type && allowedTypes.includes(initialFilters.type))
        ? initialFilters.type
        : (canViewStudent ? 'student_daily' : 'teacher');

    const [queryParams, setQueryParams] = useState({
        type: initialType,
        status: initialFilters.status || '',
        date_from: initialFilters.date_from || new Date().toISOString().substring(0, 10),
        date_to: initialFilters.date_to || initialFilters.date_from || new Date().toISOString().substring(0, 10),
        class_section_id: initialFilters.class_section_id || '',
        subject_id: initialFilters.subject_id || '',
        perPage: initialFilters.perPage || 25,
    });

    const isMounted = useRef(false);
    const prevParamsString = useRef(JSON.stringify(queryParams));

    useEffect(() => {
        const params = cleanParams(queryParams);
        const paramString = JSON.stringify(params);
        if (!isMounted.current) {
            isMounted.current = true;
            prevParamsString.current = paramString;
            return;
        }
        if (paramString === prevParamsString.current) return;
        const timeout = setTimeout(() => {
            prevParamsString.current = paramString;
            router.get('/dashboard/attendances/reports', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 400);
        return () => clearTimeout(timeout);
    }, [queryParams]);

    const summary = (obj) => {
        const total = Object.values(obj).reduce((a, b) => a + (b || 0), 0);
        const pct = (v) => total > 0 ? Math.round((v || 0) * 1000 / total) / 10 : 0;
        return { total, pctPresent: pct(obj.present) };
    };
    const teacherSum = summary(teacherSummary);
    const dailySum = summary(studentDailySummary);
    const sessionSum = summary(studentSessionSummary);

    const exportPdf = () => {
        const params = new URLSearchParams(cleanParams(queryParams));
        window.open(`/dashboard/attendances/reports/export/pdf?${params.toString()}`, '_blank');
    };
    const exportCsv = () => {
        const params = new URLSearchParams(cleanParams(queryParams));
        window.open(`/dashboard/attendances/reports/export/csv?${params.toString()}`, '_blank');
    };

    const statusOptions = ['Present', 'Absent', 'Late', 'Excused'];
    const palette = { Present: '#16a34a', Absent: '#dc2626', Late: '#f59e0b', Excused: '#3b82f6' };

    const DonutChart = ({ data, size = 160, stroke = 24 }) => {
        const total = data.reduce((a, b) => a + b.value, 0);
        const radius = (size - stroke) / 2;
        const center = size / 2;
        let start = 0;
        return (
            <svg width={size} height={size}>
                <circle cx={center} cy={center} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
                {data.map((d, i) => {
                    const frac = total ? d.value / total : 0;
                    const end = start + frac * Math.PI * 2;
                    const large = end - start > Math.PI ? 1 : 0;
                    const x1 = center + radius * Math.cos(start);
                    const y1 = center + radius * Math.sin(start);
                    const x2 = center + radius * Math.cos(end);
                    const y2 = center + radius * Math.sin(end);
                    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
                    const s = start;
                    start = end;
                    return <path key={i} d={path} stroke={d.color} strokeWidth={stroke} fill="none" />;
                })}
                <text x={center} y={center} textAnchor="middle" dominantBaseline="central" fontSize="14" fill="#111827">{total}</text>
            </svg>
        );
    };

    const GroupedBars = ({ groups }) => {
        const labels = ['Present', 'Absent', 'Late', 'Excused'];
        const max = Math.max(1, ...groups.flatMap(g => labels.map(l => g.values[l] || 0)));
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {groups.map((g) => (
                    <div key={g.title} className="border rounded p-3 bg-white">
                        <div className="font-medium mb-2">{g.title}</div>
                        <div className="space-y-2">
                            {labels.map((l) => {
                                const v = g.values[l] || 0;
                                const pct = Math.round((v * 100) / max);
                                return (
                                    <div key={l} className="flex items-center gap-2">
                                        <div className="w-24 text-sm">{l}</div>
                                        <div className="flex-1 h-3 rounded bg-gray-200">
                                            <div className="h-3 rounded" style={{ width: `${pct}%`, backgroundColor: palette[l] }} />
                                        </div>
                                        <div className="w-10 text-right text-sm">{v}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const teacherData = [
        { label: 'Present', value: teacherSummary.present || 0, color: palette.Present },
        { label: 'Absent', value: teacherSummary.absent || 0, color: palette.Absent },
        { label: 'Late', value: teacherSummary.late || 0, color: palette.Late },
        { label: 'Excused', value: teacherSummary.excused || 0, color: palette.Excused },
    ];
    const dailyData = [
        { label: 'Present', value: studentDailySummary.present || 0, color: palette.Present },
        { label: 'Absent', value: studentDailySummary.absent || 0, color: palette.Absent },
        { label: 'Late', value: studentDailySummary.late || 0, color: palette.Late },
        { label: 'Excused', value: studentDailySummary.excused || 0, color: palette.Excused },
    ];
    const sessionData = [
        { label: 'Present', value: studentSessionSummary.present || 0, color: palette.Present },
        { label: 'Absent', value: studentSessionSummary.absent || 0, color: palette.Absent },
        { label: 'Late', value: studentSessionSummary.late || 0, color: palette.Late },
        { label: 'Excused', value: studentSessionSummary.excused || 0, color: palette.Excused },
    ];

    const topSectionsByAbsence = useMemo(() => {
        const rows = (listing.data ?? listing) || [];
        const map = {};
        rows.forEach((r) => {
            if ((r.status === 'Absent' || r.status === 'Late') && r.class_section) {
                const key = `${r.class_section?.grade?.grade_name ?? ''} - ${r.class_section?.section_name ?? ''}`;
                map[key] = (map[key] || 0) + 1;
            }
        });
        const arr = Object.entries(map).map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v).slice(0, 5);
        return arr;
    }, [listing]);

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Attendance Reports', href: '/dashboard/attendances/reports' }]}>
            <Head title="Attendance Reports" />
            <div className="p-6 space-y-6">
                <div className="border rounded p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Report Type</label>
                            <Select value={queryParams.type} onValueChange={(v) => setQueryParams({ ...queryParams, type: v })}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {canViewTeacher && <SelectItem value="teacher">Teacher Daily</SelectItem>}
                                    {canViewStudent && <SelectItem value="student_daily">Student Daily</SelectItem>}
                                    {canViewStudent && <SelectItem value="student_session">Student Session</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <Select value={queryParams.status} onValueChange={(v) => setQueryParams({ ...queryParams, status: v === 'all' ? '' : v })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="All statuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date From</label>
                            <Input type="date" value={queryParams.date_from} onChange={(e) => setQueryParams({ ...queryParams, date_from: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date To</label>
                            <Input type="date" value={queryParams.date_to} onChange={(e) => setQueryParams({ ...queryParams, date_to: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                        {(queryParams.type === 'student_daily' || queryParams.type === 'student_session') && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Class Section</label>
                                <Select value={queryParams.class_section_id} onValueChange={(v) => setQueryParams({ ...queryParams, class_section_id: v === 'all' ? '' : v })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Sections" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sections</SelectItem>
                                        {classSections.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.grade?.grade_name ? `${s.grade.grade_name} - ${s.section_name}` : s.section_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {queryParams.type === 'student_session' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Subject</label>
                                <Select value={queryParams.subject_id} onValueChange={(v) => setQueryParams({ ...queryParams, subject_id: v === 'all' ? '' : v })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Subjects" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Subjects</SelectItem>
                                        {subjects.map(sub => (
                                            <SelectItem key={sub.id} value={sub.id}>{sub.subject_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-1">Per Page</label>
                            <Select value={String(queryParams.perPage)} onValueChange={(v) => setQueryParams({ ...queryParams, perPage: Number(v) })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Per Page" /></SelectTrigger>
                                <SelectContent>
                                    {[10,25,50,100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button variant="outline" onClick={exportPdf}>Export PDF</Button>
                        <Button onClick={exportCsv}>Export CSV</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {canViewTeacher && (
                        <div className="border rounded p-4 bg-white flex flex-col items-center">
                            <div className="font-medium mb-2">Teacher Daily</div>
                            <DonutChart data={teacherData} />
                            <div className="mt-2 text-sm text-gray-600">Present % {teacherSum.pctPresent}%</div>
                        </div>
                    )}
                    {canViewStudent && (
                        <div className="border rounded p-4 bg-white flex flex-col items-center">
                            <div className="font-medium mb-2">Student Daily</div>
                            <DonutChart data={dailyData} />
                            <div className="mt-2 text-sm text-gray-600">Present % {dailySum.pctPresent}%</div>
                        </div>
                    )}
                    {canViewStudent && (
                        <div className="border rounded p-4 bg-white flex flex-col items-center">
                            <div className="font-medium mb-2">Student Session</div>
                            <DonutChart data={sessionData} />
                            <div className="mt-2 text-sm text-gray-600">Present % {sessionSum.pctPresent}%</div>
                        </div>
                    )}
                </div>

                <GroupedBars
                    groups={[
                        ...(canViewTeacher ? [{ title: 'Teacher', values: { Present: teacherSummary.present || 0, Absent: teacherSummary.absent || 0, Late: teacherSummary.late || 0, Excused: teacherSummary.excused || 0 } }] : []),
                        ...(canViewStudent ? [{ title: 'Student Daily', values: { Present: studentDailySummary.present || 0, Absent: studentDailySummary.absent || 0, Late: studentDailySummary.late || 0, Excused: studentDailySummary.excused || 0 } }] : []),
                        ...(canViewStudent ? [{ title: 'Student Session', values: { Present: studentSessionSummary.present || 0, Absent: studentSessionSummary.absent || 0, Late: studentSessionSummary.late || 0, Excused: studentSessionSummary.excused || 0 } }] : []),
                    ]}
                />

                {topSectionsByAbsence.length > 0 && (
                    <div className="border rounded p-4 bg-white">
                        <div className="font-medium mb-3">Top Sections By Absences/Late</div>
                        <div className="space-y-2">
                            {topSectionsByAbsence.map((it) => (
                                <div key={it.k} className="flex items-center gap-3">
                                    <div className="flex-1">{it.k}</div>
                                    <div className="w-48 h-3 bg-gray-200 rounded">
                                        <div className="h-3 rounded" style={{ width: `${Math.min(100, it.v * 10)}%`, backgroundColor: palette.Absent }} />
                                    </div>
                                    <div className="w-10 text-right">{it.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border rounded bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead></TableHead>
                                <TableHead>Date</TableHead>
                                {queryParams.type !== 'teacher' && <TableHead>Section</TableHead>}
                                {queryParams.type === 'student_session' && <TableHead>Subject</TableHead>}
                                <TableHead>{queryParams.type === 'teacher' ? 'Teacher' : 'Student'}</TableHead>
                                {queryParams.type !== 'teacher' && <TableHead>Admission</TableHead>}
                                {queryParams.type === 'student_session' && <TableHead>Period</TableHead>}
                                <TableHead>Status</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead>Marked By</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(listing.data ?? listing).map((row, index) => (
                                <TableRow key={row.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{row.date}</TableCell>
                                    {queryParams.type !== 'teacher' && (
                                        <TableCell>{row.class_section?.grade?.grade_name ? `${row.class_section.grade.grade_name} - ${row.class_section.section_name}` : row.class_section?.section_name}</TableCell>
                                    )}
                                    {queryParams.type === 'student_session' && (
                                        <TableCell>{row.subject?.subject_name}</TableCell>
                                    )}
                                    <TableCell>
                                        {queryParams.type === 'teacher'
                                            ? (row.teacher?.user?.name || `${row.teacher?.user?.first_name} ${row.teacher?.user?.last_name}`)
                                            : (row.student?.user?.name || `${row.student?.user?.first_name} ${row.student?.user?.last_name}`)}
                                    </TableCell>
                                    {queryParams.type !== 'teacher' && (
                                        <TableCell>{row.student?.admission_number}</TableCell>
                                    )}
                                    {queryParams.type === 'student_session' && (
                                        <TableCell>{row.period || ''}</TableCell>
                                    )}
                                    <TableCell>{row.status}</TableCell>
                                    <TableCell>{row.remarks || ''}</TableCell>
                                    <TableCell>{row.marked_by_name || row.marked_by?.name || '—'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {listing.links && (
                    <div className="mt-4">
                        <Pagination links={listing.links} filters={cleanParams(queryParams)} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
