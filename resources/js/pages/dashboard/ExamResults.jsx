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
import { cleanParams } from '@/lib/utils';
import EditButton from '@/components/buttons/EditButon';
import DeleteButton from '@/components/buttons/DeleteButton';

export default function ExamResultsPage() {
    const { props } = usePage();
    const results = useMemo(() => props.results ?? [], [props.results]);
    const students = useMemo(() => props.students ?? [], [props.students]);
    const subjects = useMemo(() => props.subjects ?? [], [props.subjects]);
    const exams = useMemo(() => props.exams ?? [], [props.exams]);
    const sections = useMemo(() => props.sections ?? [], [props.sections]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [search, setSearch] = useState(initialFilters.search || '');
    const isFirstSearchEffect = useRef(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [newStudentId, setNewStudentId] = useState('');
    const [newSubjectId, setNewSubjectId] = useState('');
    const [newExamId, setNewExamId] = useState('');
    const [newSectionId, setNewSectionId] = useState('');
    const [newScore, setNewScore] = useState('');
    const [newGrade, setNewGrade] = useState('');
    const [newRemarks, setNewRemarks] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isBulkSaving, setIsBulkSaving] = useState(false);
    const [bulkSubjectId, setBulkSubjectId] = useState('');
    const [bulkExamId, setBulkExamId] = useState('');
    const [bulkSectionId, setBulkSectionId] = useState('');
    const [bulkSelectedStudents, setBulkSelectedStudents] = useState([]);
    const [bulkSelectAll, setBulkSelectAll] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editStudentId, setEditStudentId] = useState('');
    const [editSubjectId, setEditSubjectId] = useState('');
    const [editExamId, setEditExamId] = useState('');
    const [editSectionId, setEditSectionId] = useState('');
    const [editScore, setEditScore] = useState('');
    const [editGrade, setEditGrade] = useState('');
    const [editRemarks, setEditRemarks] = useState('');

    useEffect(() => {
        if (isFirstSearchEffect.current) {
            isFirstSearchEffect.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            const params = cleanParams({ search });
            router.get('/dashboard/exam-results', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 2000);
        return () => clearTimeout(timeout);
    }, [search]);

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditStudentId(row.student_id || (row.student?.id ?? ''));
        setEditSubjectId(row.subject_id || (row.subject?.id ?? ''));
        setEditExamId(row.exam_id || (row.exam?.id ?? ''));
        setEditSectionId(row.class_section_id || (row.classSection?.id ?? ''));
        setEditScore(row.score != null ? String(row.score) : '');
        setEditGrade(row.grade || '');
        setEditRemarks(row.remarks || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditStudentId(''); setEditSubjectId(''); setEditExamId(''); setEditSectionId(''); setEditScore(''); setEditGrade(''); setEditRemarks('');
    };

    const createResult = async () => {
        if (!newStudentId || !newSubjectId || !newExamId || !newSectionId || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/exam-results', {
            student_id: newStudentId,
            subject_id: newSubjectId,
            exam_id: newExamId,
            class_section_id: newSectionId,
            score: newScore || null,
            grade: newGrade || null,
            remarks: newRemarks || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewStudentId(''); setNewSubjectId(''); setNewExamId(''); setNewSectionId(''); setNewScore(''); setNewGrade(''); setNewRemarks('');
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        router.put(`/dashboard/exam-results/${editingId}`, {
            student_id: editStudentId,
            subject_id: editSubjectId,
            exam_id: editExamId,
            class_section_id: editSectionId,
            score: editScore || null,
            grade: editGrade || null,
            remarks: editRemarks || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deleteResult = async (row) => {
        const isConfirmed = await askConfirmation('Are you sure you want to delete this exam result?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/exam-results/${row.id}`, { preserveState: true, preserveScroll: true });
    };

    const studentLabel = (s) => {
        const u = s.user || {};
        const name = u.name || [u.first_name, u.last_name].filter(Boolean).join(' ');
        return name ? `${name} (${s.admission_number})` : s.admission_number || 'Unknown';
    };
    const examLabel = (e) => {
        return `${e.exam_name} - ${e.term_name}${e.academicYear ? ` (${e.academicYear.year_name})` : ''}`;
    };
    const sectionLabel = (sec) => {
        const grade = sec.grade?.grade_name || sec.grade?.name || '';
        return [grade, sec.section_name].filter(Boolean).join(' - ');
    };

    const studentsInSection = useMemo(() => {
        if (!bulkSectionId) return [];
        return (students ?? []).filter((s) => s.current_class_id === bulkSectionId || s.currentClass?.id === bulkSectionId);
    }, [students, bulkSectionId]);

    useEffect(() => {
        if (bulkSelectAll) {
            setBulkSelectedStudents(studentsInSection.map((s) => s.id));
        } else {
            setBulkSelectedStudents([]);
        }
    }, [bulkSelectAll, bulkSectionId]); // when section changes, recompute select all

    const toggleStudentSelection = (id) => {
        setBulkSelectedStudents((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            return [...prev, id];
        });
    };

    const enrollStudentsBulk = async () => {
        if (!bulkSubjectId || !bulkExamId || !bulkSectionId || isBulkSaving || bulkSelectedStudents.length === 0) return;
        setIsBulkSaving(true);
        router.post('/dashboard/exam-results/bulk', {
            subject_id: bulkSubjectId,
            exam_id: bulkExamId,
            class_section_id: bulkSectionId,
            students: bulkSelectedStudents,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsBulkOpen(false);
                setBulkSubjectId(''); setBulkExamId(''); setBulkSectionId('');
                setBulkSelectedStudents([]); setBulkSelectAll(false);
            },
            onFinish: () => setIsBulkSaving(false),
        });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Exam Results', href: '/dashboard/exam-results' }]}>
            <Head title="Exam Results" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by student, subject, exam, or section"
                        />
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setIsAddOpen(true)}>Add Result</Button>
                            <Button variant="outline" onClick={() => router.get('/dashboard/exams/enrollments/create')}>Enroll Students</Button>
                        </div>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Exam Result</DialogTitle>
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
                                    <label className="block text-sm font-medium mb-1">Subject</label>
                                    <Select value={newSubjectId} onValueChange={setNewSubjectId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((sub) => (
                                                <SelectItem key={sub.id} value={sub.id}>{sub.subject_name} ({sub.subject_code})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.subject_id && <div className="text-red-500 text-sm mt-1">{errors.subject_id}</div>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Exam</label>
                                        <Select value={newExamId} onValueChange={setNewExamId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select exam" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exams.map((e) => (
                                                    <SelectItem key={e.id} value={e.id}>{examLabel(e)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.exam_id && <div className="text-red-500 text-sm mt-1">{errors.exam_id}</div>}
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
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Score (0-100)</label>
                                        <Input type="number" value={newScore} onChange={(e) => setNewScore(e.target.value)} min={0} max={100} step="0.01" />
                                        {errors.score && <div className="text-red-500 text-sm mt-1">{errors.score}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Grade</label>
                                        <Input value={newGrade} onChange={(e) => setNewGrade(e.target.value)} placeholder="e.g. A" />
                                        {errors.grade && <div className="text-red-500 text-sm mt-1">{errors.grade}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Remarks</label>
                                        <Input value={newRemarks} onChange={(e) => setNewRemarks(e.target.value)} placeholder="Optional remarks" />
                                        {errors.remarks && <div className="text-red-500 text-sm mt-1">{errors.remarks}</div>}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewStudentId(''); setNewSubjectId(''); setNewExamId(''); setNewSectionId(''); setNewScore(''); setNewGrade(''); setNewRemarks(''); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createResult} disabled={isSaving || !newStudentId || !newSubjectId || !newExamId || !newSectionId}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
                        <DialogContent className="w-full max-w-[95vw] md:max-w-3xl lg:max-w-6xl">
                            <DialogHeader>
                                <DialogTitle>Enroll Students to Exam</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Class Section</label>
                                        <Select value={bulkSectionId} onValueChange={setBulkSectionId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((sec) => (
                                                    <SelectItem key={sec.id} value={sec.id}>{sectionLabel(sec)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Subject</label>
                                        <Select value={bulkSubjectId} onValueChange={setBulkSubjectId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.subject_name} {s.subject_code ? `(${s.subject_code})` : ''}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Exam</label>
                                        <Select value={bulkExamId} onValueChange={setBulkExamId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select exam" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exams.map((e) => (
                                                    <SelectItem key={e.id} value={e.id}>{examLabel(e)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold">Students in section</div>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={bulkSelectAll} onChange={(e) => setBulkSelectAll(e.target.checked)} />
                                            Select all
                                        </label>
                                    </div>
                                    <div className="max-h-[40vh] overflow-auto border rounded">
                                        {studentsInSection.length === 0 ? (
                                            <div className="p-3 text-sm text-muted-foreground">Select a section to view students</div>
                                        ) : (
                                            <div className="divide-y">
                                                {studentsInSection.map((s) => (
                                                    <label key={s.id} className="flex items-center gap-2 p-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={bulkSelectedStudents.includes(s.id)}
                                                            onChange={() => toggleStudentSelection(s.id)}
                                                        />
                                                        <span>{s.user ? (s.user.name || [s.user.first_name, s.user.last_name].filter(Boolean).join(' ')) : 'Unknown'}</span>
                                                        <span className="ml-auto text-xs text-muted-foreground">{s.admission_number}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsBulkOpen(false);
                                        setBulkSubjectId(''); setBulkExamId(''); setBulkSectionId('');
                                        setBulkSelectedStudents([]); setBulkSelectAll(false);
                                    }}
                                    disabled={isBulkSaving}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={enrollStudentsBulk} disabled={isBulkSaving || !bulkSubjectId || !bulkExamId || !bulkSectionId || bulkSelectedStudents.length === 0}>
                                    {isBulkSaving ? 'Saving' : 'Enroll'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Exam</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>GradeScore</TableHead>
                            <TableHead>Remarks</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(results.data ?? results).map((row) => (
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
                                        <Select value={editSubjectId} onValueChange={setEditSubjectId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map((sub) => (
                                                    <SelectItem key={sub.id} value={sub.id}>{sub.subject_name} ({sub.subject_code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.subject ? `${row.subject.subject_name} (${row.subject.subject_code})` : '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Select value={editExamId} onValueChange={setEditExamId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select exam" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exams.map((e) => (
                                                    <SelectItem key={e.id} value={e.id}>{examLabel(e)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.exam ? examLabel(row.exam) : '—'
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
                                        <Input type="number" value={editScore} onChange={(e) => setEditScore(e.target.value)} min={0} max={100} step="0.01" />
                                    ) : (
                                        row.score ?? '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Input value={editGrade} onChange={(e) => setEditGrade(e.target.value)} />
                                    ) : (
                                        row.grade ?? '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Input value={editRemarks} onChange={(e) => setEditRemarks(e.target.value)} />
                                    ) : (
                                        row.remarks ?? '—'
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2 flex ">
                                    {editingId === row.id ? (
                                        <>
                                            <Button size="sm" onClick={saveEdit}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <EditButton onClick={() => startEdit(row)} />
                                            <DeleteButton onClick={() => deleteResult(row)} />
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {results.links && (
                    <div className="mt-4">
                        <Pagination links={results.links} filters={cleanParams({ search })} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
