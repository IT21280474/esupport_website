<?php

namespace App\Enums;

/**
 * Every permission the admin panel checks. Each case is registered as a Gate
 * ability (see AppServiceProvider) and seeded into the permissions table.
 */
enum Permission: string
{
    use HasOptions;

    case ManagePages = 'manage_pages';
    case ManageMedia = 'manage_media';
    case ManageProducts = 'manage_products';
    case ManageTransportation = 'manage_transportation';
    case ManageHotel = 'manage_hotel';
    case ManageCsr = 'manage_csr';
    case ManageGallery = 'manage_gallery';
    case ManageCareers = 'manage_careers';
    case ManageInquiries = 'manage_inquiries';
    case ManageApplications = 'manage_applications';
    case ManageSettings = 'manage_settings';
    case ManageUsers = 'manage_users';
    case ViewActivity = 'view_activity';

    public function label(): string
    {
        return match ($this) {
            self::ManagePages => 'Manage pages & sections',
            self::ManageMedia => 'Manage media library',
            self::ManageProducts => 'Manage spare parts catalogue',
            self::ManageTransportation => 'Manage transportation',
            self::ManageHotel => 'Manage hotel',
            self::ManageCsr => 'Manage CSR projects',
            self::ManageGallery => 'Manage gallery',
            self::ManageCareers => 'Manage careers',
            self::ManageInquiries => 'Manage contact inquiries',
            self::ManageApplications => 'Manage job applications',
            self::ManageSettings => 'Manage global settings',
            self::ManageUsers => 'Manage admin users',
            self::ViewActivity => 'View activity log',
        };
    }

    public function group(): string
    {
        return match ($this) {
            self::ManageInquiries, self::ManageApplications => 'inquiries',
            self::ManageSettings, self::ManageUsers, self::ViewActivity => 'system',
            default => 'content',
        };
    }
}
