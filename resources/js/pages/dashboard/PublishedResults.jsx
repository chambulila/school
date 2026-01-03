import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { askConfirmation } from '@/utils/sweetAlerts';
import { cleanParams } from '@/lib/utils';
import DeleteButton from '@/components/buttons/DeleteButton';
import EditButton from '@/components/buttons/EditButon';
import SaveButton from '@/components/buttons/SaveButton';

export default function PublishedResultsPage() {
    const { props } = usePage();
    const published = useMemo(() => props.published ?? [], [props.published]);
    const exams = useMemo(() => props.exams ?? [], [props.exams]);
    const sections = useMemo(() => props.sections ?? [], [props.sections]);
    const grades = useMemo(() => props.grades ?? [], [props.grades]);
    const subjects = useMemo(() => props.subjects ?? [], [props.subjects]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [queryParams, setQueryParams] = useState({
        search: initialFilters.search || ''
    });
    const isMounted = useRef(false);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [publishScope, setPublishScope] = useState('section');
    const [newExamId, setNewExamId] = useState('');
    const [newGradeId, setNewGradeId] = useState('');
    const [newSectionId, setNewSectionId] = useState('');
    const [newSubjectId, setNewSubjectId] = useState('');
    const [newPublishedAt, setNewPublishedAt] = useState('');
    const [newNotificationSent, setNewNotificationSent] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [previewCount, setPreviewCount] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editExamId, setEditExamId] = useState('');
    const [editSectionId, setEditSectionId] = useState('');
    const [editPublishedAt, setEditPublishedAt] = useState('');
    const [editNotificationSent, setEditNotificationSent] = useState(false);

    const prevParamsString = useRef(JSON.stringify(queryParams));

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
            router.get('/dashboard/published-results', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(timeout);
    }, [queryParams]);

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
        if (!newExamId || isSaving) return;
        if (publishScope === 'grade' && !newGradeId) return;
        if (publishScope === 'section' && !newSectionId) return;
        if (publishScope === 'subject' && (!newSectionId || !newSubjectId)) return;
        setIsSaving(true);
        const confirmed = await askConfirmation(`Publish ${previewCount ?? ''} results?`);
        if (!confirmed) { setIsSaving(false); return; }
        router.post('/dashboard/published-results', {
            publish_scope: publishScope,
            exam_id: newExamId,
            grade_id: newGradeId || null,
            class_section_id: newSectionId || null,
            subject_id: newSubjectId || null,
            published_at: newPublishedAt || null,
            notification_sent: newNotificationSent,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setPublishScope('section');
                setNewExamId(''); setNewGradeId(''); setNewSectionId(''); setNewSubjectId(''); setNewPublishedAt(''); setNewNotificationSent(false);
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

    useEffect(() => {
        const canPreview = !!newExamId && (
            publishScope === 'exam' ||
            (publishScope === 'grade' && !!newGradeId) ||
            (publishScope === 'section' && !!newSectionId) ||
            (publishScope === 'subject' && !!newSectionId && !!newSubjectId)
        );
        if (!canPreview) { setPreviewCount(null); return; }
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            fetch('/dashboard/published-results/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    publish_scope: publishScope,
                    exam_id: newExamId,
                    grade_id: newGradeId || null,
                    class_section_id: newSectionId || null,
                    subject_id: newSubjectId || null,
                }),
                signal: controller.signal,
            }).then(res => res.json()).then(data => {
                setPreviewCount(data.count ?? null);
            }).catch(() => {});
        }, 300);
        return () => { clearTimeout(timeout); controller.abort(); };
    }, [publishScope, newExamId, newGradeId, newSectionId, newSubjectId]);

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Published Results', href: '/dashboard/published-results' }]}>
            <Head title="Published Results" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={queryParams.search}
                            onChange={(e) => setQueryParams({ ...queryParams, search: e.target.value })}
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
                                    <label className="block text-sm font-medium mb-1">Publish Scope</label>
                                    <Select value={publishScope} onValueChange={setPublishScope}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select scope" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="exam">Exam</SelectItem>
                                            <SelectItem value="grade">Grade</SelectItem>
                                            <SelectItem value="section">Section</SelectItem>
                                            <SelectItem value="subject">Subject</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.publish_scope && <div className="text-red-500 text-sm mt-1">{errors.publish_scope}</div>}
                                </div>
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
                                {publishScope === 'grade' && (
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
                                        {errors.grade_id && <div className="text-red-500 text-sm mt-1">{errors.grade_id}</div>}
                                    </div>
                                )}
                                {(publishScope === 'section' || publishScope === 'subject') && (
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
                                )}
                                {publishScope === 'subject' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Subject</label>
                                        <Select value={newSubjectId} onValueChange={setNewSubjectId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map((sub) => (
                                                    <SelectItem key={sub.id} value={sub.id}>{sub.subject_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.subject_id && <div className="text-red-500 text-sm mt-1">{errors.subject_id}</div>}
                                    </div>
                                )}
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
                                <div className="text-sm text-gray-600">
                                    {previewCount === null ? 'Select scope and filters to preview count' : `This will publish ${previewCount} result(s).`}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setPublishScope('section'); setNewExamId(''); setNewGradeId(''); setNewSectionId(''); setNewSubjectId(''); setNewPublishedAt(''); setNewNotificationSent(false); setPreviewCount(null); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createPublished} disabled={
                                    isSaving ||
                                    !newExamId ||
                                    (publishScope === 'grade' && !newGradeId) ||
                                    (publishScope === 'section' && !newSectionId) ||
                                    (publishScope === 'subject' && (!newSectionId || !newSubjectId))
                                }>
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
                                        row.class_section ? sectionLabel(row.class_section) : '—'
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
                                    {row.published_by ? publisherLabel(row.published_by) : '—'}
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
                                            <SaveButton onClick={saveEdit}>Save</SaveButton>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <EditButton onClick={() => startEdit(row)} />
                                            <DeleteButton onClick={() => deletePublished(row)} />
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {published.links && (
                    <div className="mt-4">
                        <Pagination links={published.links} filters={cleanParams(queryParams)} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
