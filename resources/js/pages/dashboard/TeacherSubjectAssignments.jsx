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

export default function TeacherSubjectAssignmentsPage() {
    const { props } = usePage();
    const assignments = useMemo(() => props.assignments ?? [], [props.assignments]);
    const teachers = useMemo(() => props.teachers ?? [], [props.teachers]);
    const subjects = useMemo(() => props.subjects ?? [], [props.subjects]);
    const sections = useMemo(() => props.sections ?? [], [props.sections]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [search, setSearch] = useState(initialFilters.search || '');
    const isFirstSearchEffect = useRef(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newTeacherId, setNewTeacherId] = useState('');
    const [newSubjectId, setNewSubjectId] = useState('');
    const [newSectionId, setNewSectionId] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editTeacherId, setEditTeacherId] = useState('');
    const [editSubjectId, setEditSubjectId] = useState('');
    const [editSectionId, setEditSectionId] = useState('');

    useEffect(() => {
        if (isFirstSearchEffect.current) {
            isFirstSearchEffect.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            router.get('/dashboard/teacher-subject-assignments', { search }, { replace: true, preserveState: true, preserveScroll: true });
        }, 2000);
        return () => clearTimeout(timeout);
    }, [search]);

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditTeacherId(row.teacher_id || (row.teacher?.id ?? ''));
        setEditSubjectId(row.subject_id || (row.subject?.id ?? ''));
        setEditSectionId(row.class_section_id || (row.classSection?.id ?? ''));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTeacherId('');
        setEditSubjectId('');
        setEditSectionId('');
    };

    const createAssignment = async () => {
        if (!newTeacherId || !newSubjectId || !newSectionId || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/teacher-subject-assignments', {
            teacher_id: newTeacherId,
            subject_id: newSubjectId,
            class_section_id: newSectionId,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewTeacherId('');
                setNewSubjectId('');
                setNewSectionId('');
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        router.put(`/dashboard/teacher-subject-assignments/${editingId}`, {
            teacher_id: editTeacherId,
            subject_id: editSubjectId,
            class_section_id: editSectionId,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deleteAssignment = async (row) => {
        const isConfirmed = await askConfirmation('Are you sure you want to delete this teacher subject assignment?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/teacher-subject-assignments/${row.id}`, { preserveState: true, preserveScroll: true });
    };

    const teacherDisplay = (t) => {
        const u = t.user || {};
        return u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || t.employee_number || 'Unknown';
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Teacher Subjects', href: '/dashboard/teacher-subject-assignments' }]}>
            <Head title="Teacher Subject Assignments" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by teacher, subject, or section"
                        />
                        <Button onClick={() => setIsAddOpen(true)}>Add Assignment</Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Teacher Subject Assignment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Teacher</label>
                                    <Select value={newTeacherId} onValueChange={setNewTeacherId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map((t) => (
                                                <SelectItem key={t.id} value={t.id}>{teacherDisplay(t)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.teacher_id && <div className="text-red-500 text-sm mt-1">{errors.teacher_id}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subject</label>
                                    <Select value={newSubjectId} onValueChange={setNewSubjectId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.subject_id && <div className="text-red-500 text-sm mt-1">{errors.subject_id}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Class Section</label>
                                    <Select value={newSectionId} onValueChange={setNewSectionId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map((sec) => (
                                                <SelectItem key={sec.id} value={sec.id}>
                                                    {sec.section_name} {sec.grade ? `(${sec.grade.grade_name})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.class_section_id && <div className="text-red-500 text-sm mt-1">{errors.class_section_id}</div>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewTeacherId(''); setNewSubjectId(''); setNewSectionId(''); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createAssignment} disabled={isSaving || !newTeacherId || !newSubjectId || !newSectionId}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Class Section</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(assignments.data ?? assignments).map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Select value={editTeacherId} onValueChange={setEditTeacherId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select teacher" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teachers.map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>{teacherDisplay(t)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.teacher ? teacherDisplay(row.teacher) : '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Select value={editSubjectId} onValueChange={setEditSubjectId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.subject ? `${row.subject.subject_name} (${row.subject.subject_code})` : '—'
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
                                                    <SelectItem key={sec.id} value={sec.id}>
                                                        {sec.section_name} {sec.grade ? `(${sec.grade.grade_name})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.classSection ? `${row.classSection.section_name}${row.classSection.grade ? ` (${row.classSection.grade.grade_name})` : ''}` : '—'
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    {editingId === row.id ? (
                                        <>
                                            <Button size="sm" onClick={saveEdit}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Pencil className="w-5 h-5 cursor-pointer" onClick={() => startEdit(row)} />
                                            <Trash className="w-5 h-5 cursor-pointer text-red-800" onClick={() => deleteAssignment(row)} />
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {assignments.links && (
                    <div className="mt-4">
                        <Pagination links={assignments.links} filters={{ search }} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

