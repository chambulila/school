<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePublishedResultRequest;
use App\Http\Requests\Admin\UpdatePublishedResultRequest;
use App\Models\Grade;
use App\Models\ClassSection;
use App\Models\Exam;
use App\Models\PublishedResult;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Services\PublishExamResultsService;
use Inertia\Inertia;
use Inertia\Response;

class PublishedResultController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('publish-exam-results');
        $published = PublishedResult::query()
            ->with(['exam:id,term_name,exam_name', 'classSection:id,section_name,grade_id', 'classSection.grade:id,grade_name', 'publishedBy:id,first_name,last_name', 'subject:id,subject_name'])
            ->filter($request->only('search'))
            ->orderBy('published_at', 'desc')
            ->paginate($request->input('perPage', 10))
            ->withQueryString();

        return Inertia::render('dashboard/PublishedResults', [
            'published' => $published,
            'exams' => Exam::query()->select('id', 'term_name', 'exam_name', 'start_date')->with('academicYear')->orderBy('start_date', 'desc')->get(),
            'sections' => ClassSection::query()->with('grade:id,grade_name')->select('id', 'section_name', 'grade_id')->orderBy('section_name')->get(),
            'grades' => Grade::query()->select('id', 'grade_name')->orderBy('grade_name')->get(),
            'subjects' => \App\Models\Subject::query()->select('id', 'subject_name')->orderBy('subject_name')->get(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(StorePublishedResultRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $result = PublishExamResultsService::publish(
            $data['publish_scope'],
            $data['exam_id'],
            $data['grade_id'] ?? null,
            $data['class_section_id'] ?? null,
            $data['subject_id'] ?? null,
            $request->user()->id,
            $data['published_at'] ?? null,
        );
        return back()->with('success', "Results published ({$result['created']} entries)");
    }

    public function update(UpdatePublishedResultRequest $request, PublishedResult $publishedResult): RedirectResponse
    {
        $publishedResult->update($request->validated());
        return back()->with('success', 'Published result updated');
    }

    public function destroy(PublishedResult $publishedResult): RedirectResponse
    {
        ifCan('publish-exam-results');
        $publishedResult->delete();
        return back()->with('success', 'Published result removed');
    }

    public function preview(Request $request): \Illuminate\Http\JsonResponse
    {
        ifCan('publish-exam-results');
        $data = $request->validate([
            'publish_scope' => ['required', 'in:exam,grade,section,subject'],
            'exam_id' => ['required', 'uuid', 'exists:exams,id'],
            'grade_id' => ['nullable', 'uuid', 'exists:grades,id'],
            'class_section_id' => ['nullable', 'uuid', 'exists:class_sections,id'],
            'subject_id' => ['nullable', 'uuid', 'exists:subjects,id'],
        ]);
        $count = PublishExamResultsService::previewCount(
            $data['publish_scope'],
            $data['exam_id'],
            $data['grade_id'] ?? null,
            $data['class_section_id'] ?? null,
            $data['subject_id'] ?? null,
        );
        return response()->json(['count' => $count]);
    }
}
