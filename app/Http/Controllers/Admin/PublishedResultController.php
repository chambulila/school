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
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 10);

        $published = PublishedResult::query()
            ->with(['exam.academicYear', 'classSection.grade', 'publishedBy'])
            ->when($search !== '', function ($q) use ($search) {
                $q->whereHas('exam', function ($eq) use ($search) {
                    $eq->where('exam_name', 'like', '%'.$search.'%')
                       ->orWhere('term_name', 'like', '%'.$search.'%');
                })
                ->orWhereHas('classSection', function ($cq) use ($search) {
                    $cq->where('section_name', 'like', '%'.$search.'%');
                });
                // ->orWhereHas('publishedBy', function ($pq) use ($search) {
                //     $pq->where('name', 'like', '%'.$search.'%')
                //        ->orWhere('first_name', 'like', '%'.$search.'%')
                //        ->orWhere('last_name', 'like', '%'.$search.'%')
                //        ->orWhere('email', 'like', '%'.$search.'%');
                // });
            })
            ->orderBy('published_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/PublishedResults', [
            'published' => $published,
            'exams' => Exam::query()->with('academicYear')->orderBy('start_date', 'desc')->get(),
            'sections' => ClassSection::query()->with('grade')->orderBy('section_name')->get(),
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
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

