<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\BusinessArea;
use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use App\Http\Controllers\Controller;
use App\Http\Resources\InquiryResource;
use App\Models\ContactInquiry;
use App\Services\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InquiryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return InquiryResource::collection(
            $this->filtered($request)->with('handler:id,name')->latest()->latest('id')
                ->paginate($request->integer('per_page', 25))
        );
    }

    public function show(ContactInquiry $inquiry): InquiryResource
    {
        return new InquiryResource($inquiry->load('handler:id,name'));
    }

    public function update(Request $request, ContactInquiry $inquiry): InquiryResource
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(InquiryStatus::class)],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $inquiry->update($data + ['handled_by' => $request->user()->id]);

        return new InquiryResource($inquiry->load('handler:id,name'));
    }

    public function destroy(ContactInquiry $inquiry): JsonResponse
    {
        $inquiry->delete();

        return response()->json(['message' => 'Inquiry deleted.']);
    }

    /** CSV export of the current filter (opens directly in Excel). */
    public function export(Request $request): StreamedResponse
    {
        $query = $this->filtered($request)->latest();
        ActivityLogger::log('exported', 'Exported inquiries to CSV');

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel
            fputcsv($out, ['Date', 'Type', 'Business area', 'Status', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Details']);

            $query->chunk(500, function ($inquiries) use ($out) {
                foreach ($inquiries as $inquiry) {
                    fputcsv($out, array_map(fn ($value) => $this->csvSafe($value), [
                        $inquiry->created_at?->format('Y-m-d H:i'),
                        $inquiry->type->label(),
                        $inquiry->business_area->label(),
                        $inquiry->status->label(),
                        $inquiry->name,
                        $inquiry->email,
                        $inquiry->phone,
                        $inquiry->subject,
                        $inquiry->message,
                        collect($inquiry->meta ?? [])->map(fn ($v, $k) => "{$k}: {$v}")->implode('; '),
                    ]));
                }
            });

            fclose($out);
        }, 'inquiries-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** Neutralise spreadsheet formula injection from visitor-supplied text. */
    private function csvSafe(?string $value): string
    {
        $value = (string) $value;

        return preg_match('/^[=+\-@\t\r]/', $value) ? "'".$value : $value;
    }

    private function filtered(Request $request): Builder
    {
        $request->validate([
            'status' => ['nullable', Rule::enum(InquiryStatus::class)],
            'business_area' => ['nullable', Rule::enum(BusinessArea::class)],
            'type' => ['nullable', Rule::enum(InquiryType::class)],
            'search' => ['nullable', 'string', 'max:100'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        return ContactInquiry::query()
            ->when($request->input('status'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->input('business_area'), fn ($q, $v) => $q->where('business_area', $v))
            ->when($request->input('type'), fn ($q, $v) => $q->where('type', $v))
            ->when($request->date('from'), fn ($q, $d) => $q->where('created_at', '>=', $d->startOfDay()))
            ->when($request->date('to'), fn ($q, $d) => $q->where('created_at', '<=', $d->endOfDay()))
            ->when($request->string('search')->toString(), function ($q, $term) {
                $like = '%'.addcslashes($term, '%_\\').'%';
                $q->where(fn ($w) => $w->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('phone', 'like', $like)
                    ->orWhere('subject', 'like', $like));
            });
    }
}
