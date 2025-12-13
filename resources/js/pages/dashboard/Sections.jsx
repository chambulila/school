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

export default function SectionsPage() {
    const { props } = usePage();
    const sections = useMemo(() => props.sections ?? [], [props.sections]);
    const grades = useMemo(() => props.grades ?? [], [props.grades]);
    const teachers = useMemo(() => props.teachers ?? [], [props.teachers]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [search, setSearch] = useState(initialFilters.search || '');
    const isFirstSearchEffect = useRef(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newGradeId, setNewGradeId] = useState('');
    const [newSectionName, setNewSectionName] = useState('');
    const [newTeacherId, setNewTeacherId] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editGradeId, setEditGradeId] = useState('');
    const [editSectionName, setEditSectionName] = useState('');

    useEffect(() => {
        if (isFirstSearchEffect.current) {
            isFirstSearchEffect.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            router.get('/dashboard/sections', { search }, { replace: true, preserveState: true, preserveScroll: true });
        }, 2000);
        return () => clearTimeout(timeout);
    }, [search]);

    const [editTeacherId, setEditTeacherId] = useState('');
    const startEdit = (section) => {
        setEditingId(section.id);
        setEditGradeId(section.grade_id || section.grade?.id || '');
        setEditSectionName(section.section_name || '');
        setEditTeacherId(section.class_teacher_id || section.class_teacher?.id || section.classTeacher?.id || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditGradeId('');
        setEditSectionName('');
    };

    const createSection = async () => {
        if (!newGradeId || !newSectionName.trim() || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/sections', { grade_id: newGradeId, section_name: newSectionName, class_teacher_id: newTeacherId || null }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewGradeId('');
                setNewSectionName('');
                setNewTeacherId('');
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => {
                setIsSaving(false);
            },
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        router.put(`/dashboard/sections/${editingId}`, { grade_id: editGradeId, section_name: editSectionName, class_teacher_id: editTeacherId || null }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deleteSection = async (section) => {
        const isConfirmed = await askConfirmation('Are you sure you want to delete this section?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/sections/${section.id}`, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Class Sections', href: '/dashboard/sections' }]}>
            <Head title="Class Sections" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by section name"
                        />
                        <Button onClick={() => setIsAddOpen(true)}>Add New Section</Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Section</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Grade</label>
                                    <Select value={newGradeId} onValueChange={setNewGradeId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {grades.map((g) => (
                                                <SelectItem key={g.id} value={g.id}>{g.grade_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.grade_id && (
                                        <div className="text-red-500 text-sm mt-1">{errors.grade_id}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Class Teacher (optional)</label>
                                    <Select value={newTeacherId} onValueChange={setNewTeacherId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select class teacher (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map((t) => (
                                                <SelectItem key={t.id} value={t.id}>{t.user?.name ?? t.employee_number}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.class_teacher_id && (
                                        <div className="text-red-500 text-sm mt-1">{errors.class_teacher_id}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Section Name</label>
                                    <Input
                                        value={newSectionName}
                                        onChange={(e) => setNewSectionName(e.target.value)}
                                        placeholder="e.g. A"
                                    />
                                    {errors.section_name && (
                                        <div className="text-red-500 text-sm mt-1">{errors.section_name}</div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewGradeId(''); setNewSectionName(''); setNewTeacherId(''); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createSection} disabled={isSaving || !newGradeId || !newSectionName.trim()}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Section</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(sections.data ?? sections).map((s) => (
                            <TableRow key={s.id}>
                                <TableCell>
                                    {editingId === s.id ? (
                                        <Input value={editSectionName} onChange={(e) => setEditSectionName(e.target.value)} />
                                    ) : (
                                        s.section_name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === s.id ? (
                                        <Select value={editGradeId} onValueChange={setEditGradeId}>
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {grades.map((g) => (
                                                    <SelectItem key={g.id} value={g.id}>{g.grade_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        s.grade?.grade_name ?? ''
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === s.id ? (
                                        <Select value={editTeacherId} onValueChange={setEditTeacherId}>
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Select class teacher (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teachers.map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>{t.user?.name ?? t.employee_number}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        s.classTeacher?.user?.name ?? s.class_teacher?.user?.name ?? ''
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    {editingId === s.id ? (
                                        <>
                                            <Button size="sm" onClick={saveEdit}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Pencil className="w-5 h-5 cursor-pointer" onClick={() => startEdit(s)} />
                                            <Trash className="w-5 h-5 cursor-pointer text-red-800" onClick={() => deleteSection(s)} />
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {sections.links && (
                    <div className="mt-4">
                        <Pagination links={sections.links} filters={{ search }} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
