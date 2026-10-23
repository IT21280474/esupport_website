<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:120'],
            'vehicle_type' => ['nullable', 'string', 'max:120'],
            'brand' => ['nullable', 'string', 'max:120'],
            'featured' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ]);

        $products = Product::active()
            ->filter($filters)
            ->when($request->boolean('featured'), fn ($q) => $q->where('is_featured', true))
            ->with(['category', 'brand', 'vehicleTypes', 'image'])
            ->ordered()
            ->paginate($filters['per_page'] ?? 12)
            ->withQueryString();

        return ProductResource::collection($products);
    }

    public function show(string $slug): array
    {
        $product = Product::active()
            ->where('slug', $slug)
            ->with(['category', 'brand', 'vehicleTypes', 'image', 'gallery'])
            ->firstOrFail();

        $related = Product::active()
            ->whereKeyNot($product->id)
            ->where('product_category_id', $product->product_category_id)
            ->with(['category', 'image'])
            ->ordered()
            ->limit(4)
            ->get();

        return [
            'product' => (new ProductResource($product))->resolve(),
            'related' => ProductResource::collection($related)->resolve(),
        ];
    }
}
