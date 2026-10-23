<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ApplicationStatus;
use App\Enums\InquiryStatus;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Http\Resources\InquiryResource;
use App\Http\Resources\JobApplicationResource;
use App\Models\ActivityLog;
use App\Models\Career;
use App\Models\ContactInquiry;
use App\Models\CsrProject;
use App\Models\FleetItem;
use App\Models\GalleryImage;
use App\Models\HotelRoom;
use App\Models\JobApplication;
use App\Models\Media;
use App\Models\PageSection;
use App\Models\Product;
use App\Models\SocialLink;
use App\Models\TransportationService;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Overview figures, recent submissions and a launch checklist. Each block is
 * included only when the signed-in user has the matching permission.
 */
class DashboardController extends Controller
{
    public function __invoke(Request $request, SettingsService $settings): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $payload = ['stats' => []];

        if ($user->hasPermission(Permission::ManageInquiries)) {
            $payload['stats']['inquiries'] = [
                'total' => ContactInquiry::count(),
                'new' => ContactInquiry::where('status', InquiryStatus::New)->count(),
                'contact' => ContactInquiry::where('type', 'contact')->count(),
                'last_30_days' => ContactInquiry::where('created_at', '>=', now()->subDays(30))->count(),
            ];
            $payload['inquiries_by_area'] = ContactInquiry::selectRaw('business_area, count(*) as total')
                ->groupBy('business_area')->pluck('total', 'business_area');
            $payload['recent_inquiries'] = InquiryResource::collection(ContactInquiry::latest()->limit(6)->get())->resolve();
        }

        if ($user->hasPermission(Permission::ManageApplications)) {
            $payload['stats']['applications'] = [
                'total' => JobApplication::count(),
                'new' => JobApplication::where('status', ApplicationStatus::New)->count(),
            ];
            $payload['recent_applications'] = JobApplicationResource::collection(JobApplication::latest()->limit(5)->get())->resolve();
        }

        if ($user->hasPermission(Permission::ManageProducts)) {
            $payload['stats']['products'] = ['total' => Product::count(), 'active' => Product::where('is_active', true)->count()];
        }
        if ($user->hasPermission(Permission::ManageGallery)) {
            $payload['stats']['gallery'] = ['total' => GalleryImage::count()];
        }
        if ($user->hasPermission(Permission::ManageCsr)) {
            $payload['stats']['csr'] = ['total' => CsrProject::count()];
        }
        if ($user->hasPermission(Permission::ManageTransportation)) {
            $payload['stats']['transport'] = ['fleet' => FleetItem::count(), 'services' => TransportationService::count()];
        }
        if ($user->hasPermission(Permission::ManageHotel)) {
            $payload['stats']['rooms'] = ['total' => HotelRoom::count()];
        }
        if ($user->hasPermission(Permission::ManageCareers)) {
            $payload['stats']['careers'] = ['open' => Career::open()->count()];
        }
        if ($user->hasPermission(Permission::ManageMedia)) {
            $payload['stats']['media'] = ['total' => Media::count()];
        }

        if ($user->hasPermission(Permission::ViewActivity)) {
            $payload['recent_activity'] = ActivityLog::with('user:id,name')->latest('created_at')->latest('id')->limit(8)->get()
                ->map(fn (ActivityLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'user' => $log->user?->name,
                    'created_at' => $log->created_at,
                ]);
        }

        if ($user->hasPermission(Permission::ManageSettings)) {
            $payload['checklist'] = $this->checklist($settings);
        }

        return response()->json($payload);
    }

    /** Items that need real client content or configuration before launch. */
    private function checklist(SettingsService $settings): array
    {
        $chairman = PageSection::where('type', 'chairman_message')->first();

        return [
            ['label' => 'WhatsApp number confirmed for each desk', 'done' => filled($settings->get('whatsapp.spare_parts_number')) && filled($settings->get('whatsapp.transport_number')) && filled($settings->get('whatsapp.hotel_number')), 'link' => '/admin/settings?tab=whatsapp'],
            ['label' => 'Notification email recipients set', 'done' => filled($settings->get('notifications.inquiry_recipients')), 'link' => '/admin/settings?tab=notifications'],
            ['label' => 'Social media links added', 'done' => SocialLink::whereNotNull('url')->exists(), 'link' => '/admin/settings?tab=social'],
            ['label' => 'Chairman portrait uploaded (About page)', 'done' => filled($chairman?->content['image'] ?? null), 'link' => '/admin/pages'],
            ['label' => 'Spare parts products added', 'done' => Product::exists(), 'link' => '/admin/products'],
            ['label' => 'Default social sharing image set', 'done' => filled($settings->get('seo.og_image')), 'link' => '/admin/settings?tab=seo'],
        ];
    }
}
