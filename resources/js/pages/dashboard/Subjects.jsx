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
import AddButton from '@/components/buttons/AddButton';

export default function SubjectsPage() {
    const { props } = usePage();
    const subjects = useMemo(() => props.subjects ?? [], [props.subjects]);
    const grades = useMemo(() => props.grades ?? [], [props.grades]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};

    // Unified Filter State
    const [queryParams, setQueryParams] = useState({
        search: initialFilters.search || '',
        grade_id: initialFilters.grade_id || 'all',
    });

    const prevParamsString = useRef(JSON.stringify(queryParams));

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCode, setNewCode] = useState('');
    const [newGradeId, setNewGradeId] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editCode, setEditCode] = useState('');
    const [editGradeId, setEditGradeId] = useState('');

    const handleFilterChange = (key, value) => {
        setQueryParams(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setQueryParams({
            search: '',
            grade_id: 'all',
        });
    };

    const isMounted = useRef(false);

    useEffect(() => {
        const params = cleanParams(queryParams);
        Object.keys(params).forEach(key => {
            if (params[key] === 'all') delete params[key];
        });
        const paramString = JSON.stringify(params);

        if (!isMounted.current) {
            isMounted.current = true;
            prevParamsString.current = paramString;
            return;
        }

        if (paramString === prevParamsString.current) return;

        const timeout = setTimeout(() => {
            prevParamsString.current = paramString;
            router.get('/dashboard/subjects', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(timeout);
    }, [queryParams]);

    const startEdit = (subject) => {
        setEditingId(subject.id);
        setEditName(subject.subject_name || '');
        setEditCode(subject.subject_code || '');
        setEditGradeId(subject.grade_id || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditCode('');
        setEditGradeId('');
    };

    const createSubject = async () => {
        if (!newName.trim() || !newCode.trim() || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/subjects', {
            subject_name: newName,
            subject_code: newCode,
            grade_id: newGradeId || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewName('');
                setNewCode('');
                setNewGradeId('');
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
        router.put(`/dashboard/subjects/${editingId}`, {
            subject_name: editName,
            subject_code: editCode,
            grade_id: editGradeId || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deleteSubject = async (subject) => {
        const isConfirmed = await askConfirmation('Are you sure you want to delete this subject?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/subjects/${subject.id}`, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Subjects', href: '/dashboard/subjects' }]}>
            <Head title="Subjects" />
            <div className="p-6">
                <div className="mb-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="flex gap-2 flex-1 flex-wrap items-center">
                            <Input
                                className="w-64"
                                value={queryParams.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Search by name or code"
                            />
                            <Select value={queryParams.grade_id} onValueChange={(v) => handleFilterChange('grade_id', v)}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Grade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Grades</SelectItem>
                                    {grades.map(g => (
                                        <SelectItem key={g.id} value={g.id}>{g.grade_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" onClick={resetFilters}>Reset</Button>
                        </div>
                        <AddButton onClick={() => setIsAddOpen(true)}>Add New Subject</AddButton>
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Subject</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subject Name</label>
                                    <Input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g. Mathematics"
                                    />
                                    {errors.subject_name && (
                                        <div className="text-red-500 text-sm mt-1">{errors.subject_name}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subject Code</label>
                                    <Input
                                        value={newCode}
                                        onChange={(e) => setNewCode(e.target.value)}
                                        placeholder="e.g. MATH-101"
                                    />
                                    {errors.subject_code && (
                                        <div className="text-red-500 text-sm mt-1">{errors.subject_code}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Grade (optional)</label>
                                    <Select value={newGradeId} onValueChange={setNewGradeId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {grades.map((g) => (
                                                <SelectItem key={g.id} value={g.id}>{g.grade_name}</SelectItem>
                                            ))}
                                            <SelectItem value="">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.grade_id && (
                                        <div className="text-red-500 text-sm mt-1">{errors.grade_id}</div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewName(''); setNewCode(''); setNewGradeId(''); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createSubject} disabled={isSaving || !newName.trim() || !newCode.trim()}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(subjects.data ?? subjects).map((s) => (
                            <TableRow key={s.id}>
                                <TableCell>
                                    {editingId === s.id ? (
                                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    ) : (
                                        s.subject_name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === s.id ? (
                                        <Input value={editCode} onChange={(e) => setEditCode(e.target.value)} />
                                    ) : (
                                        s.subject_code
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === s.id ? (
                                        <Select value={editGradeId} onValueChange={setEditGradeId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {grades.map((g) => (
                                                    <SelectItem key={g.id} value={g.id}>{g.grade_name}</SelectItem>
                                                ))}
                                                <SelectItem value="">None</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        s.grade ? s.grade.grade_name : '—'
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
                                            <Trash className="w-5 h-5 cursor-pointer text-red-800" onClick={() => deleteSubject(s)} />
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {subjects.links && (
                    <div className="mt-4">
                        <Pagination links={subjects.links} filters={cleanParams(queryParams)} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
