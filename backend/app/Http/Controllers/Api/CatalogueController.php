<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FleetItemResource;
use App\Http\Resources\GalleryImageResource;
use App\Http\Resources\HotelAmenityResource;
use App\Http\Resources\HotelRoomResource;
use App\Http\Resources\TaxonomyResource;
use App\Http\Resources\TransportationServiceResource;
use App\Models\Brand;
use App\Models\FleetItem;
use App\Models\GalleryAlbum;
use App\Models\GalleryImage;
use App\Models\HotelAmenity;
use App\Models\HotelRoom;
use App\Models\ProductCategory;
use App\Models\TransportationService;
use App\Models\VehicleType;
use App\Support\ContentCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only collections for the public site. Pages already embed what they
 * need; these endpoints serve integrations and client-side filtering.
 */
class CatalogueController extends Controller
{
    public function productFilters(): JsonResponse
    {
        return response()->json(ContentCache::remember('product-filters', fn () => [
            'categories' => TaxonomyResource::collection(ProductCategory::active()->ordered()->get())->resolve(),
            'vehicle_types' => TaxonomyResource::collection(VehicleType::active()->ordered()->get())->resolve(),
            'brands' => TaxonomyResource::collection(Brand::active()->ordered()->get())->resolve(),
        ]));
    }

    public function transportation(): JsonResponse
    {
        return response()->json(ContentCache::remember('transportation', fn () => [
            'services' => TransportationServiceResource::collection(TransportationService::active()->ordered()->with('image')->get())->resolve(),
            'fleet' => FleetItemResource::collection(FleetItem::active()->ordered()->with(['image', 'vehicleType', 'gallery'])->get())->resolve(),
        ]));
    }

    public function hotel(): JsonResponse
    {
        return response()->json(ContentCache::remember('hotel', fn () => [
            'rooms' => HotelRoomResource::collection(HotelRoom::active()->ordered()->with(['image', 'gallery', 'amenities'])->get())->resolve(),
            'amenities' => HotelAmenityResource::collection(HotelAmenity::active()->ordered()->get())->resolve(),
        ]));
    }

    public function gallery(Request $request): JsonResponse
    {
        $album = $request->string('album')->toString();

        return response()->json(ContentCache::remember('gallery:'.md5($album), fn () => [
            'albums' => TaxonomyResource::collection(GalleryAlbum::active()->ordered()->with('cover')->get())->resolve(),
            'images' => GalleryImageResource::collection(
                GalleryImage::active()->ordered()
                    ->whereHas('album', fn ($q) => $q->where('is_active', true)->when($album, fn ($q) => $q->where('slug', $album)))
                    ->with(['media', 'album'])
                    ->get()
            )->resolve(),
        ]));
    }
}
