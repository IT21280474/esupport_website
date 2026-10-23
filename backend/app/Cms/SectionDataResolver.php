<?php

namespace App\Cms;

use App\Http\Resources\CareerResource;
use App\Http\Resources\CsrProjectResource;
use App\Http\Resources\FleetItemResource;
use App\Http\Resources\GalleryImageResource;
use App\Http\Resources\HotelAmenityResource;
use App\Http\Resources\HotelRoomResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\TaxonomyResource;
use App\Http\Resources\TransportationServiceResource;
use App\Models\Brand;
use App\Models\Career;
use App\Models\CsrCategory;
use App\Models\CsrProject;
use App\Models\FleetItem;
use App\Models\GalleryAlbum;
use App\Models\GalleryImage;
use App\Models\HotelAmenity;
use App\Models\HotelRoom;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\TransportationService;
use App\Models\VehicleType;

/**
 * Supplies live records to data-driven sections (see 'data' in SectionRegistry),
 * so a whole page is delivered in a single API response.
 */
class SectionDataResolver
{
    /** @param  array<string, mixed>  $content */
    public function resolve(string $source, array $content): mixed
    {
        return $this->{$source}($content);
    }

    private function productCategories(): array
    {
        return TaxonomyResource::collection(ProductCategory::active()->ordered()->get())->resolve();
    }

    private function partFinder(): array
    {
        return [
            'vehicle_types' => TaxonomyResource::collection(VehicleType::active()->ordered()->get())->resolve(),
            'categories' => TaxonomyResource::collection(ProductCategory::active()->ordered()->get())->resolve(),
            'has_products' => Product::active()->exists(),
        ];
    }

    private function productCatalogue(array $content): array
    {
        $featured = ! empty($content['featured_only']);
        $query = Product::active()->when($featured, fn ($q) => $q->where('is_featured', true));

        return [
            'total' => $query->count(),
            'filters' => $featured ? null : [
                'categories' => TaxonomyResource::collection(ProductCategory::active()->ordered()->get())->resolve(),
                'vehicle_types' => TaxonomyResource::collection(VehicleType::active()->ordered()->get())->resolve(),
                'brands' => TaxonomyResource::collection(Brand::active()->ordered()->get())->resolve(),
            ],
        ];
    }

    private function featuredProducts(array $content): array
    {
        return ProductResource::collection(
            Product::active()->where('is_featured', true)->ordered()
                ->with(['category', 'brand', 'image', 'vehicleTypes'])
                ->limit($content['limit'] ?? 4)->get()
        )->resolve();
    }

    private function brands(array $content): array
    {
        return TaxonomyResource::collection(
            Brand::active()->ordered()->with('logo')
                ->when(! empty($content['logos_only']), fn ($query) => $query->whereNotNull('logo_id'))
                ->get()
        )->resolve();
    }

    private function fleet(): array
    {
        return FleetItemResource::collection(
            FleetItem::active()->ordered()->with(['image', 'vehicleType'])->get()
        )->resolve();
    }

    private function transportServices(array $content): array
    {
        return TransportationServiceResource::collection(
            TransportationService::active()->ordered()
                ->when(! empty($content['featured_only']), fn ($q) => $q->where('is_featured', true))
                ->with('image')->get()
        )->resolve();
    }

    private function rooms(): array
    {
        return HotelRoomResource::collection(
            HotelRoom::active()->ordered()->with(['image', 'amenities'])->get()
        )->resolve();
    }

    private function amenities(): array
    {
        return HotelAmenityResource::collection(HotelAmenity::active()->ordered()->get())->resolve();
    }

    private function csrCategories(): array
    {
        return TaxonomyResource::collection(CsrCategory::active()->ordered()->get())->resolve();
    }

    private function csrProjects(array $content): array
    {
        return CsrProjectResource::collection(
            CsrProject::active()->ordered()
                ->when(! empty($content['featured_only']), fn ($q) => $q->where('is_featured', true))
                ->with(['image', 'category'])
                ->limit($content['limit'] ?? 12)->get()
        )->resolve();
    }

    private function gallery(array $content): array
    {
        $limit = (int) ($content['limit'] ?? 0);

        $images = GalleryImage::active()->ordered()
            ->whereHas('album', fn ($q) => $q->where('is_active', true))
            ->when(! empty($content['featured_only']), fn ($q) => $q->where('is_featured', true))
            ->with(['media', 'album'])
            ->when($limit > 0, fn ($q) => $q->limit($limit))
            ->get();

        $albumIds = $images->pluck('gallery_album_id')->unique();

        return [
            'albums' => TaxonomyResource::collection(
                GalleryAlbum::active()->ordered()->whereKey($albumIds)->get()
            )->resolve(),
            'images' => GalleryImageResource::collection($images)->resolve(),
        ];
    }

    private function galleryPreview(array $content): array
    {
        return GalleryImageResource::collection(
            GalleryImage::active()->where('is_featured', true)->ordered()
                ->with(['media', 'album'])->limit($content['limit'] ?? 6)->get()
        )->resolve();
    }

    private function jobs(): array
    {
        return CareerResource::collection(Career::open()->ordered()->get())->resolve();
    }
}
