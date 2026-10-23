<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Brand;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\VehicleType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesAdmins;
use Tests\TestCase;

class ProductCatalogueTest extends TestCase
{
    use CreatesAdmins, RefreshDatabase;

    private ProductCategory $brakes;

    private ProductCategory $engine;

    private VehicleType $lorries;

    private VehicleType $buses;

    private Brand $wabco;

    protected function setUp(): void
    {
        parent::setUp();

        $this->brakes = ProductCategory::create(['name' => 'Brake Components']);
        $this->engine = ProductCategory::create(['name' => 'Engine Components']);
        $this->lorries = VehicleType::create(['name' => 'Lorries']);
        $this->buses = VehicleType::create(['name' => 'Buses']);
        $this->wabco = Brand::create(['name' => 'WABCO']);
    }

    public function test_admin_can_create_a_product_with_vehicle_types_and_an_ordered_gallery(): void
    {
        [$first, $second, $third] = [$this->media(), $this->media(), $this->media()];
        $this->actingAsAdmin(Role::ContentManager);

        $response = $this->postJson('/api/admin/products', [
            'name' => 'Brake Drum 410mm',
            'sku' => 'BD-410',
            'product_category_id' => $this->brakes->id,
            'brand_id' => $this->wabco->id,
            'vehicle_type_ids' => [$this->lorries->id, $this->buses->id],
            'image_id' => $first->id,
            'gallery_ids' => [$third->id, $first->id, $second->id],
            'description' => '<p>Heavy duty.</p><script>alert(1)</script>',
        ]);

        $response->assertCreated()
            ->assertJsonPath('slug', 'brake-drum-410mm')
            ->assertJsonPath('category.slug', 'brake-components')
            ->assertJsonPath('brand.name', 'WABCO')
            ->assertJsonPath('image.id', $first->id)
            ->assertJsonPath('gallery_ids', [$third->id, $first->id, $second->id])
            ->assertJsonPath('description', '<p>Heavy duty.</p>');

        $this->assertEqualsCanonicalizing([$this->lorries->id, $this->buses->id], $response->json('vehicle_type_ids'));

        $product = Product::sole();
        $this->assertTrue($product->is_active);
        $this->assertSame([$third->id, $first->id, $second->id], $product->gallery()->pluck('media.id')->all());
    }

    public function test_product_name_is_required(): void
    {
        $this->actingAsAdmin(Role::ContentManager);

        $this->postJson('/api/admin/products', ['vehicle_type_ids' => [999], 'gallery_ids' => [999]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'vehicle_type_ids.0', 'gallery_ids.0']);
    }

    public function test_slugs_are_generated_and_kept_unique(): void
    {
        $this->actingAsAdmin(Role::ContentManager);

        $this->postJson('/api/admin/products', ['name' => 'Clutch Plate'])->assertCreated()->assertJsonPath('slug', 'clutch-plate');
        $second = $this->postJson('/api/admin/products', ['name' => 'Clutch Plate'])->assertCreated()->assertJsonPath('slug', 'clutch-plate-2');

        // Soft-deleted products still reserve their slug
        $this->deleteJson('/api/admin/products/'.$second->json('id'))->assertOk();
        $this->postJson('/api/admin/products', ['name' => 'Clutch Plate'])->assertCreated()->assertJsonPath('slug', 'clutch-plate-3');

        // An explicit duplicate slug is a validation error, not a silent rename
        $this->postJson('/api/admin/products', ['name' => 'Another clutch', 'slug' => 'clutch-plate'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_sku_is_unique_among_active_products_and_freed_when_a_product_is_deleted(): void
    {
        $this->actingAsAdmin(Role::ContentManager);
        $original = $this->postJson('/api/admin/products', ['name' => 'Brake Drum', 'sku' => 'BD-410'])->assertCreated()->json('id');

        $this->postJson('/api/admin/products', ['name' => 'Brake Drum (copy)', 'sku' => 'BD-410'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['sku']);

        // Saving a product with its own SKU is not a conflict
        $this->putJson("/api/admin/products/{$original}", ['name' => 'Brake Drum 410mm', 'sku' => 'BD-410'])->assertOk();

        // Once deleted, the part number can be reused; the trashed record holding it is purged
        $this->deleteJson("/api/admin/products/{$original}")->assertOk();
        $this->postJson('/api/admin/products', ['name' => 'Brake Drum (new supplier)', 'sku' => 'BD-410'])
            ->assertCreated()
            ->assertJsonPath('sku', 'BD-410');

        $this->assertDatabaseMissing('products', ['id' => $original]);
        $this->assertSame(1, Product::withTrashed()->where('sku', 'BD-410')->count());
    }

    public function test_admin_can_update_relations_and_delete_a_product(): void
    {
        [$first, $second, $third] = [$this->media(), $this->media(), $this->media()];
        $this->actingAsAdmin(Role::ContentManager);
        $id = $this->postJson('/api/admin/products', [
            'name' => 'Piston Ring Set',
            'vehicle_type_ids' => [$this->lorries->id, $this->buses->id],
            'gallery_ids' => [$first->id, $second->id, $third->id],
        ])->assertCreated()->json('id');

        $this->putJson("/api/admin/products/{$id}", [
            'name' => 'Piston Ring Set (STD)',
            'vehicle_type_ids' => [$this->buses->id],
            'gallery_ids' => [$third->id, $first->id],
        ])
            ->assertOk()
            ->assertJsonPath('slug', 'piston-ring-set')
            ->assertJsonPath('vehicle_type_ids', [$this->buses->id])
            ->assertJsonPath('gallery_ids', [$third->id, $first->id]);

        // Relations not sent are left untouched
        $this->putJson("/api/admin/products/{$id}", ['name' => 'Piston Ring Set'])
            ->assertOk()
            ->assertJsonPath('vehicle_type_ids', [$this->buses->id])
            ->assertJsonPath('gallery_ids', [$third->id, $first->id]);

        $this->deleteJson("/api/admin/products/{$id}")->assertOk();
        $this->assertSoftDeleted('products', ['id' => $id]);
        $this->getJson("/api/admin/products/{$id}")->assertNotFound();
    }

    public function test_public_catalogue_lists_only_active_products_and_filters_them(): void
    {
        $drum = $this->product('Brake Drum', $this->brakes, $this->lorries, ['sku' => 'BD-410']);
        $this->product('Piston Ring', $this->engine, $this->buses, ['sku' => 'PR-77', 'short_description' => 'Standard size ring set']);
        $this->product('Old Brake Shoe', $this->brakes, $this->lorries, ['is_active' => false]);

        $this->assertSame(['Brake Drum', 'Piston Ring'], $this->publicNames('/api/products'));
        $this->assertSame(['Brake Drum'], $this->publicNames('/api/products?category=brake-components'));
        $this->assertSame(['Piston Ring'], $this->publicNames('/api/products?vehicle_type=buses'));
        $this->assertSame(['Piston Ring'], $this->publicNames('/api/products?search=PR-77'));
        $this->assertSame(['Piston Ring'], $this->publicNames('/api/products?search=standard'));
        $this->assertSame(['Brake Drum'], $this->publicNames('/api/products?search=drum&vehicle_type=lorries'));
        $this->assertSame([], $this->publicNames('/api/products?category=brake-components&vehicle_type=buses'));

        $this->getJson("/api/products/{$drum->slug}")
            ->assertOk()
            ->assertJsonPath('product.name', 'Brake Drum')
            ->assertJsonPath('product.vehicle_types.0.slug', 'lorries')
            ->assertJsonMissingPath('product.is_active');
    }

    public function test_inactive_products_are_hidden_from_public_endpoints(): void
    {
        $hidden = $this->product('Old Brake Shoe', $this->brakes, $this->lorries, ['is_active' => false]);
        $active = $this->product('Brake Drum', $this->brakes, $this->lorries);

        $this->getJson("/api/products/{$hidden->slug}")->assertNotFound();
        $this->getJson("/api/products/{$active->slug}")
            ->assertOk()
            ->assertJsonCount(0, 'related'); // the inactive sibling is not suggested either

        // Deactivating from the admin list takes it off the website
        $this->actingAsAdmin(Role::ContentManager);
        $this->patchJson("/api/admin/products/{$active->id}/toggle", ['field' => 'is_active'])->assertOk();
        $this->getJson("/api/products/{$active->slug}")->assertNotFound();
        $this->assertSame([], $this->publicNames('/api/products'));
    }

    /** @param  array<string, mixed>  $attributes */
    private function product(string $name, ProductCategory $category, VehicleType $vehicle, array $attributes = []): Product
    {
        $product = Product::create(['name' => $name, 'product_category_id' => $category->id, 'is_active' => true, ...$attributes]);
        $product->vehicleTypes()->attach($vehicle);

        return $product;
    }

    /** @return array<int, string> */
    private function publicNames(string $uri): array
    {
        return $this->getJson($uri)->assertOk()->json('data.*.name');
    }

    /** A media-library record; the file itself is not needed here. */
    private function media(): Media
    {
        $name = fake()->unique()->slug(2).'.jpg';

        return Media::create([
            'disk' => 'public', 'directory' => 'media/2026/10', 'filename' => $name,
            'original_name' => $name, 'mime_type' => 'image/jpeg', 'extension' => 'jpg',
            'size' => 2048, 'width' => 800, 'height' => 600, 'type' => Media::TYPE_IMAGE,
        ]);
    }
}
