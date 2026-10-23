<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('disk', 32)->default('public');
            $table->string('directory');
            $table->string('filename');
            $table->string('original_name');
            $table->string('mime_type', 100);
            $table->string('extension', 10);
            $table->unsignedBigInteger('size');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->string('type', 20)->index(); // image | document
            $table->string('alt')->nullable();
            $table->string('title')->nullable();
            $table->string('caption', 500)->nullable();
            $table->json('variants')->nullable(); // generated WebP sizes
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('created_at');
        });

        // Ordered image galleries attached to any model (products, rooms, fleet, CSR projects...)
        Schema::create('mediables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained()->cascadeOnDelete();
            $table->morphs('mediable');
            $table->string('collection', 50)->default('gallery');
            $table->unsignedInteger('sort_order')->default(0);

            $table->index(['mediable_type', 'mediable_id', 'collection', 'sort_order'], 'mediables_lookup_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mediables');
        Schema::dropIfExists('media');
    }
};
