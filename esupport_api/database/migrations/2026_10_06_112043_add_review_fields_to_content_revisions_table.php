<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('content_revisions', function (Blueprint $table) {
            $table->string('status', 16)->default('approved')->after('data')->index();
            $table->timestamp('base_updated_at')->nullable()->after('user_id');
            $table->foreignId('reviewed_by')->nullable()->after('base_updated_at')->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            $table->text('review_note')->nullable()->after('reviewed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('content_revisions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reviewed_by');
            $table->dropIndex(['status']);
            $table->dropColumn(['status', 'base_updated_at', 'reviewed_at', 'review_note']);
        });
    }
};
