<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ---- Transportation --------------------------------------------------
        Schema::create('transportation_services', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('icon', 40)->nullable();
            $table->text('description')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('fleet_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('vehicle_type_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->string('capacity')->nullable();
            $table->text('details')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // ---- Hotel -----------------------------------------------------------
        Schema::create('hotel_amenities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icon', 40)->nullable();
            $table->string('description', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('hotel_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('price_label', 60)->nullable(); // e.g. "per night"
            $table->unsignedTinyInteger('capacity')->nullable();
            $table->string('bed_type', 100)->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('status', 20)->default('available'); // available | unavailable
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('hotel_amenity_hotel_room', function (Blueprint $table) {
            $table->foreignId('hotel_amenity_id')->constrained()->cascadeOnDelete();
            $table->foreignId('hotel_room_id')->constrained()->cascadeOnDelete();
            $table->primary(['hotel_amenity_id', 'hotel_room_id']);
        });

        // ---- Gallery ---------------------------------------------------------
        Schema::create('gallery_albums', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('description', 500)->nullable();
            $table->foreignId('cover_id')->nullable()->constrained('media')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('gallery_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_album_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('media_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('description', 500)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['gallery_album_id', 'is_active', 'sort_order']);
        });

        // ---- CSR -------------------------------------------------------------
        Schema::create('csr_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon', 40)->nullable();
            $table->string('description', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('csr_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('csr_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('excerpt', 500)->nullable();
            $table->longText('description')->nullable();
            $table->date('project_date')->nullable();
            $table->string('date_label', 60)->nullable(); // e.g. "Ongoing initiative"
            $table->string('location')->nullable();
            $table->foreignId('image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'is_featured', 'sort_order']);
        });

        // ---- Careers ---------------------------------------------------------
        Schema::create('careers', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('department')->nullable();
            $table->string('location')->nullable();
            $table->string('employment_type', 30)->default('full_time');
            $table->string('summary', 500)->nullable();
            $table->longText('description')->nullable();
            $table->longText('responsibilities')->nullable();
            $table->longText('requirements')->nullable();
            $table->date('closing_date')->nullable();
            $table->string('status', 20)->default('draft')->index(); // draft | published | closed
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('career_id')->nullable()->constrained()->nullOnDelete();
            $table->string('position');
            $table->string('name');
            $table->string('email');
            $table->string('phone', 30);
            $table->text('message')->nullable();
            $table->string('cv_path');
            $table->string('cv_original_name');
            $table->string('cv_mime', 100);
            $table->unsignedBigInteger('cv_size');
            $table->string('status', 20)->default('new')->index(); // new | reviewing | shortlisted | rejected | hired
            $table->text('notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
        });

        // ---- Inquiries -------------------------------------------------------
        Schema::create('contact_inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('type', 20)->default('contact')->index(); // contact | transport | hotel | part_request
            $table->string('business_area', 20)->default('general')->index();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('subject')->nullable();
            $table->text('message')->nullable();
            $table->json('meta')->nullable(); // form-specific details (dates, guests, vehicle, part no...)
            $table->string('status', 20)->default('new')->index(); // new | in_progress | resolved | archived
            $table->text('notes')->nullable();
            $table->foreignId('handled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_inquiries');
        Schema::dropIfExists('job_applications');
        Schema::dropIfExists('careers');
        Schema::dropIfExists('csr_projects');
        Schema::dropIfExists('csr_categories');
        Schema::dropIfExists('gallery_images');
        Schema::dropIfExists('gallery_albums');
        Schema::dropIfExists('hotel_amenity_hotel_room');
        Schema::dropIfExists('hotel_rooms');
        Schema::dropIfExists('hotel_amenities');
        Schema::dropIfExists('fleet_items');
        Schema::dropIfExists('transportation_services');
    }
};
