<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        ifCan('view-audit-logs');
        $search = (string) $request->input('search', '');
        $perPage = (int) $request->input('perPage', 20);
        $action = (string) $request->input('action', '');
        $module = (string) $request->input('module', '');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $logs = AuditLog::query()
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('user_name', 'like', '%'.$search.'%')
                       ->orWhere('role', 'like', '%'.$search.'%')
                       ->orWhere('action_type', 'like', '%'.$search.'%')
                       ->orWhere('entity_name', 'like', '%'.$search.'%')
                       ->orWhere('entity_id', 'like', '%'.$search.'%')
                       ->orWhere('module', 'like', '%'.$search.'%')
                       ->orWhere('category', 'like', '%'.$search.'%')
                       ->orWhere('notes', 'like', '%'.$search.'%')
                       ->orWhere('ip_address', 'like', '%'.$search.'%')
                       ->orWhere('browser', 'like', '%'.$search.'%');
                });
            })
            ->when($action !== '', fn($q) => $q->where('action_type', $action))
            ->when($module !== '', fn($q) => $q->where('module', $module))
            ->when($dateFrom, fn($q) => $q->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo, fn($q) => $q->whereDate('created_at', '<=', $dateTo))
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $actionTypes = AuditLog::query()->select('action_type')->distinct()->orderBy('action_type')->pluck('action_type')->toArray();
        $modules = AuditLog::query()->select('module')->distinct()->orderBy('module')->pluck('module')->filter()->values()->toArray();

        return Inertia::render('dashboard/AuditLogs', [
            'logs' => $logs,
            'actionTypes' => $actionTypes,
            'modules' => $modules,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
                'action' => $action,
                'module' => $module,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}

