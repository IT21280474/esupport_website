<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportLeadsController extends Controller
{
    /**
     * CSV of all enquiries. Cells are formula-escaped for spreadsheet safety.
     */
    public function __invoke(): StreamedResponse
    {
        $filename = 'esupport-enquiries-'.now()->toDateString().'.csv';

        return response()->streamDownload(function (): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['ID', 'Email', 'Name', 'Phone', 'Message', 'Source', 'Received (UTC)', 'Read'], escape: '');

            Lead::query()->latest('id')->lazy()->each(function (Lead $lead) use ($out): void {
                fputcsv($out, array_map($this->cell(...), [
                    $lead->id,
                    $lead->email,
                    $lead->name,
                    $lead->phone,
                    $lead->message,
                    $lead->source,
                    $lead->created_at?->toDateTimeString(),
                    $lead->read_at ? 'yes' : 'no',
                ]), escape: '');
            });

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=utf-8']);
    }

    private function cell(mixed $value): string
    {
        $text = (string) $value;

        return preg_match('/^[=+\-@]/', $text) ? "'".$text : $text;
    }
}
