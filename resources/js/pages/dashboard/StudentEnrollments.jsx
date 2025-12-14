import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash } from 'lucide-react';
import { askConfirmation } from '@/utils/sweetAlerts';

export default function StudentEnrollmentsPage() {
    const { props } = usePage();
    const enrollments = useMemo(() => props.enrollments ?? [], [props.enrollments]);
    const students = useMemo(() => props.students ?? [], [props.students]);
    const sections = useMemo(() => props.sections ?? [], [props.sections]);
    const years = useMemo(() => props.years ?? [], [props.years]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [search, setSearch] = useState(initialFilters.search || '');
    const isFirstSearchEffect = useRef(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newStudentId, setNewStudentId] = useState('');
    const [newSectionId, setNewSectionId] = useState('');
    const [newYearId, setNewYearId] = useState('');
    const [newEnrollDate, setNewEnrollDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editStudentId, setEditStudentId] = useState('');
    const [editSectionId, setEditSectionId] = useState('');
    const [editYearId, setEditYearId] = useState('');
    const [editEnrollDate, setEditEnrollDate] = useState('');

    useEffect(() => {
        if (isFirstSearchEffect.current) {
            isFirstSearchEffect.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            router.get('/dashboard/student-enrollments', { search }, { replace: true, preserveState: true, preserveScroll: true });
        }, 2000);
        return () => clearTimeout(timeout);
    }, [search]);

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditStudentId(row.student_id || (row.student?.id ?? ''));
        setEditSectionId(row.class_section_id || (row.classSection?.id ?? ''));
        setEditYearId(row.academic_year_id || (row.academicYear?.id ?? ''));
        setEditEnrollDate(row.enrollment_date || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditStudentId(''); setEditSectionId(''); setEditYearId(''); setEditEnrollDate('');
    };

    const createEnrollment = async () => {
        if (!newStudentId || !newSectionId || !newYearId || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/student-enrollments', {
            student_id: newStudentId,
            class_section_id: newSectionId,
            academic_year_id: newYearId,
            enrollment_date: newEnrollDate || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewStudentId(''); setNewSectionId(''); setNewYearId(''); setNewEnrollDate('');
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        router.put(`/dashboard/student-enrollments/${editingId}`, {
            student_id: editStudentId,
            class_section_id: editSectionId,
            academic_year_id: editYearId,
            enrollment_date: editEnrollDate || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deleteEnrollment = async (row) => {
        const isConfirmed = await askConfirmation('Are you sure you want to delete this enrollment?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/student-enrollments/${row.id}`, { preserveState: true, preserveScroll: true });
    };

    const studentLabel = (s) => {
        const u = s.user || {};
        const name = u.name || [u.first_name, u.last_name].filter(Boolean).join(' ');
        return name ? `${name} (${s.admission_number})` : s.admission_number || 'Unknown';
    };

    const sectionLabel = (sec) => {
        const grade = sec.grade?.grade_name || sec.grade?.name || '';
        return [grade, sec.section_name].filter(Boolean).join(' - ');
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Student Enrollments', href: '/dashboard/student-enrollments' }]}>
            <Head title="Student Enrollments" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by student, section, or academic year"
                        />
                        <Button onClick={() => setIsAddOpen(true)}>Add Enrollment</Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Student Enrollment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Student</label>
                                    <Select value={newStudentId} onValueChange={setNewStudentId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>{studentLabel(s)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.student_id && <div className="text-red-500 text-sm mt-1">{errors.student_id}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Class Section</label>
                                    <Select value={newSectionId} onValueChange={setNewSectionId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map((sec) => (
                                                <SelectItem key={sec.id} value={sec.id}>{sectionLabel(sec)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.class_section_id && <div className="text-red-500 text-sm mt-1">{errors.class_section_id}</div>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Academic Year</label>
                                        <Select value={newYearId} onValueChange={setNewYearId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((y) => (
                                                    <SelectItem key={y.id} value={y.id}>{y.year_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.academic_year_id && <div className="text-red-500 text-sm mt-1">{errors.academic_year_id}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Enrollment Date (optional)</label>
                                        <Input type="date" value={newEnrollDate} onChange={(e) => setNewEnrollDate(e.target.value)} />
                                        {errors.enrollment_date && <div className="text-red-500 text-sm mt-1">{errors.enrollment_date}</div>}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewStudentId(''); setNewSectionId(''); setNewYearId(''); setNewEnrollDate(''); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createEnrollment} disabled={isSaving || !newStudentId || !newSectionId || !newYearId}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Class Section</TableHead>
                            <TableHead>Academic Year</TableHead>
                            <TableHead>Enrollment Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(enrollments.data ?? enrollments).map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Select value={editStudentId} onValueChange={setEditStudentId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select student" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{studentLabel(s)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.student ? studentLabel(row.student) : '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Select value={editSectionId} onValueChange={setEditSectionId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((sec) => (
                                                    <SelectItem key={sec.id} value={sec.id}>{sectionLabel(sec)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.classSection ? sectionLabel(row.classSection) : '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Select value={editYearId} onValueChange={setEditYearId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((y) => (
                                                    <SelectItem key={y.id} value={y.id}>{y.year_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.academicYear ? row.academicYear.year_name : '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Input type="date" value={editEnrollDate} onChange={(e) => setEditEnrollDate(e.target.value)} />
                                    ) : (
                                        row.enrollment_date || '—'
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    {editingId === row.id ? (
                                        <>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                            <Button size="sm" onClick={saveEdit} disabled={!editStudentId || !editSectionId || !editYearId}>Save</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="sm" variant="outline" onClick={() => startEdit(row)}>
                                                <Pencil className="mr-1 h-4 w-4" /> Edit
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => deleteEnrollment(row)}>
                                                <Trash className="mr-1 h-4 w-4" /> Delete
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {enrollments.links && (
                    <div className="mt-4">
                        <Pagination links={enrollments.links} filters={{ search }} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
