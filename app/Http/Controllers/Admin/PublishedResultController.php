<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePublishedResultRequest;
use App\Http\Requests\Admin\UpdatePublishedResultRequest;
use App\Models\ClassSection;
use App\Models\Exam;
use App\Models\PublishedResult;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublishedResultController extends Controller
{
    public function index(Request $request): Response
    {
        $published = PublishedResult::query()
            ->with(['exam.academicYear', 'classSection.grade', 'publishedBy'])
            ->filter($request->only('search'))
            ->orderBy('published_at', 'desc')
            ->paginate($request->input('perPage', 10))
            ->withQueryString();

        return Inertia::render('dashboard/PublishedResults', [
            'published' => $published,
            'exams' => Exam::query()->with('academicYear')->orderBy('start_date', 'desc')->get(),
            'sections' => ClassSection::query()->with('grade')->orderBy('section_name')->get(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(StorePublishedResultRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['published_by'] = $request->user()->id;
        $data['published_at'] = $data['published_at'] ?? now();
        PublishedResult::create($data);
        return back()->with('success', 'Results published');
    }

    public function update(UpdatePublishedResultRequest $request, PublishedResult $publishedResult): RedirectResponse
    {
        $publishedResult->update($request->validated());
        return back()->with('success', 'Published result updated');
    }

    public function destroy(PublishedResult $publishedResult): RedirectResponse
    {
        $publishedResult->delete();
        return back()->with('success', 'Published result removed');
    }
}

