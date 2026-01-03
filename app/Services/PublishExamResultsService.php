<?php

namespace App\Services;

use App\Models\ClassSection;
use App\Models\ExamResult;
use App\Models\PublishedResult;
use Illuminate\Support\Facades\DB;
use App\Services\AuditService;

class PublishExamResultsService
{
    public static function publish(string $scope, string $examId, ?string $gradeId, ?string $classSectionId, ?string $subjectId, string $publishedBy, ?string $publishedAt = null): array
    {
        $publishedAt = $publishedAt ?: now();
        $created = 0;

        return DB::transaction(function () use ($scope, $examId, $gradeId, $classSectionId, $subjectId, $publishedBy, $publishedAt, &$created) {
            if ($scope === 'exam') {
                $sectionIds = ExamResult::where('exam_id', $examId)->distinct()->pluck('class_section_id')->all();
                foreach ($sectionIds as $secId) {
                    $created += self::upsertPublication($examId, $secId, null, 'exam', $publishedBy, $publishedAt);
                }
            } elseif ($scope === 'grade') {
                $sectionIds = ClassSection::where('grade_id', $gradeId)->pluck('id')->all();
                $sectionIds = self::filterSectionsWithExam($sectionIds, $examId);
                foreach ($sectionIds as $secId) {
                    $created += self::upsertPublication($examId, $secId, null, 'grade', $publishedBy, $publishedAt);
                }
            } elseif ($scope === 'section') {
                $created += self::upsertPublication($examId, $classSectionId, null, 'section', $publishedBy, $publishedAt);
            } elseif ($scope === 'subject') {
                $created += self::upsertPublication($examId, $classSectionId, $subjectId, 'subject', $publishedBy, $publishedAt);
            }

            return ['created' => $created];
        });
    }

    public static function previewCount(string $scope, string $examId, ?string $gradeId, ?string $classSectionId, ?string $subjectId): int
    {
        if ($scope === 'exam') {
            return ExamResult::where('exam_id', $examId)->count();
        } elseif ($scope === 'grade') {
            return ExamResult::where('exam_id', $examId)
                ->whereHas('classSection', fn($q) => $q->where('grade_id', $gradeId))
                ->count();
        } elseif ($scope === 'section') {
            return ExamResult::where('exam_id', $examId)
                ->where('class_section_id', $classSectionId)
                ->count();
        } elseif ($scope === 'subject') {
            return ExamResult::where('exam_id', $examId)
                ->where('class_section_id', $classSectionId)
                ->where('subject_id', $subjectId)
                ->count();
        }
        return 0;
    }

    protected static function upsertPublication(string $examId, string $classSectionId, ?string $subjectId, string $scope, string $publishedBy, $publishedAt): int
    {
        $exists = PublishedResult::query()
            ->where('exam_id', $examId)
            ->where('class_section_id', $classSectionId)
            ->when($subjectId, fn($q) => $q->where('subject_id', $subjectId))
            ->exists();

        if ($exists) {
            return 0;
        }

        PublishedResult::create([
            'exam_id' => $examId,
            'class_section_id' => $classSectionId,
            'subject_id' => $subjectId,
            'publish_scope' => $scope,
            'published_by' => $publishedBy,
            'published_at' => $publishedAt,
            'notification_sent' => false,
        ]);
        AuditService::log(
            actionType: 'PUBLISH',
            entityName: 'PublishedResult',
            entityId: 'MULTI',
            oldValue: null,
            newValue: [
                'exam_id' => $examId,
                'class_section_id' => $classSectionId,
                'subject_id' => $subjectId,
                'scope' => $scope,
                'published_at' => (string)$publishedAt,
            ],
            module: 'Exams & Results',
            category: 'Publishing',
            notes: "Published scope={$scope} exam={$examId} section={$classSectionId} subject={$subjectId}"
        );
        return 1;
    }

    protected static function filterSectionsWithExam(array $sectionIds, string $examId): array
    {
        if (empty($sectionIds)) return [];
        $idsWithResults = ExamResult::where('exam_id', $examId)
            ->whereIn('class_section_id', $sectionIds)
            ->distinct()
            ->pluck('class_section_id')
            ->all();
        return $idsWithResults;
    }
}
