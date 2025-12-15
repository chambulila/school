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

export default function PublishedResultsPage() {
    const { props } = usePage();
    const published = useMemo(() => props.published ?? [], [props.published]);
    const exams = useMemo(() => props.exams ?? [], [props.exams]);
    const sections = useMemo(() => props.sections ?? [], [props.sections]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [search, setSearch] = useState(initialFilters.search || '');
    const isFirstSearchEffect = useRef(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newExamId, setNewExamId] = useState('');
    const [newSectionId, setNewSectionId] = useState('');
    const [newPublishedAt, setNewPublishedAt] = useState('');
    const [newNotificationSent, setNewNotificationSent] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editExamId, setEditExamId] = useState('');
    const [editSectionId, setEditSectionId] = useState('');
    const [editPublishedAt, setEditPublishedAt] = useState('');
    const [editNotificationSent, setEditNotificationSent] = useState(false);

    useEffect(() => {
        if (isFirstSearchEffect.current) {
            isFirstSearchEffect.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            const params = cleanParams({ search });
            router.get('/dashboard/published-results', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 2000);
        return () => clearTimeout(timeout);
    }, [search]);

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditExamId(row.exam_id || (row.exam?.id ?? ''));
        setEditSectionId(row.class_section_id || (row.classSection?.id ?? ''));
        setEditPublishedAt(row.published_at ? row.published_at.substring(0, 10) : '');
        setEditNotificationSent(Boolean(row.notification_sent));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditExamId(''); setEditSectionId(''); setEditPublishedAt(''); setEditNotificationSent(false);
    };

    const createPublished = async () => {
        if (!newExamId || !newSectionId || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/published-results', {
            exam_id: newExamId,
            class_section_id: newSectionId,
            published_at: newPublishedAt || null,
            notification_sent: newNotificationSent,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewExamId(''); setNewSectionId(''); setNewPublishedAt(''); setNewNotificationSent(false);
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        router.put(`/dashboard/published-results/${editingId}`, {
            exam_id: editExamId,
            class_section_id: editSectionId,
            published_at: editPublishedAt || null,
            notification_sent: editNotificationSent,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deletePublished = async (row) => {
        const isConfirmed = await askConfirmation('Are you sure you want to remove this published record?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/published-results/${row.id}`, { preserveState: true, preserveScroll: true });
    };

    const examLabel = (e) => `${e.exam_name} - ${e.term_name}${e.academicYear ? ` (${e.academicYear.year_name})` : ''}`;
    const sectionLabel = (sec) => {
        const grade = sec.grade?.grade_name || sec.grade?.name || '';
        return [grade, sec.section_name].filter(Boolean).join(' - ');
    };
    const publisherLabel = (u) => u?.name || [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.email || '—';

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Published Results', href: '/dashboard/published-results' }]}>
            <Head title="Published Results" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by exam, section, or publisher"
                        />
                        <Button onClick={() => setIsAddOpen(true)}>Publish Results</Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Publish Exam Results</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Published At (optional)</label>
                                        <Input type="date" value={newPublishedAt} onChange={(e) => setNewPublishedAt(e.target.value)} />
                                        {errors.published_at && <div className="text-red-500 text-sm mt-1">{errors.published_at}</div>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input id="notify" type="checkbox" checked={newNotificationSent} onChange={(e) => setNewNotificationSent(e.target.checked)} />
                                        <label htmlFor="notify">Notification sent</label>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewExamId(''); setNewSectionId(''); setNewPublishedAt(''); setNewNotificationSent(false); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createPublished} disabled={isSaving || !newExamId || !newSectionId}>
                                    {isSaving ? 'Saving' : 'Publish'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Exam</TableHead>
                            <TableHead>Class Section</TableHead>
                            <TableHead>Published At</TableHead>
                            <TableHead>Published By</TableHead>
                            <TableHead>Notification Sent</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(published.data ?? published).map((row) => (
                            <TableRow key={row.id}>
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
                                        <Input type="date" value={editPublishedAt} onChange={(e) => setEditPublishedAt(e.target.value)} />
                                    ) : (
                                        row.published_at ? row.published_at.substring(0, 10) : '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {row.publishedBy ? publisherLabel(row.publishedBy) : '—'}
                                </TableCell>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <div className="flex items-center gap-2">
                                            <input id={`notify-${row.id}`} type="checkbox" checked={editNotificationSent} onChange={(e) => setEditNotificationSent(e.target.checked)} />
                                            <label htmlFor={`notify-${row.id}`}>Sent</label>
                                        </div>
                                    ) : (
                                        row.notification_sent ? 'Yes' : 'No'
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    {editingId === row.id ? (
                                        <>
                                            <Button size="sm" onClick={saveEdit}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="sm" variant="outline" onClick={() => startEdit(row)}>
                                                <Pencil className="mr-1 h-4 w-4" /> Edit
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => deletePublished(row)}>
                                                <Trash className="mr-1 h-4 w-4" /> Delete
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {published.links && (
                    <div className="mt-4">
                        <Pagination links={published.links} filters={cleanParams({ search })} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
