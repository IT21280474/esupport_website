<?php

namespace App\Enums;

enum Role: string
{
    case SuperAdmin = 'super_admin';
    case ContentManager = 'content_manager';
    case InquiryManager = 'inquiry_manager';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::ContentManager => 'Content Manager',
            self::InquiryManager => 'Inquiry Manager',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Full access, including settings, users and the activity log.',
            self::ContentManager => 'Manages pages, media, products, transportation, hotel, CSR, gallery and careers.',
            self::InquiryManager => 'Manages contact inquiries and job applications.',
        };
    }

    /** @return array<int, Permission> */
    public function permissions(): array
    {
        return match ($this) {
            self::SuperAdmin => Permission::cases(),
            self::ContentManager => [
                Permission::ManagePages, Permission::ManageMedia, Permission::ManageProducts,
                Permission::ManageTransportation, Permission::ManageHotel, Permission::ManageCsr,
                Permission::ManageGallery, Permission::ManageCareers,
            ],
            self::InquiryManager => [Permission::ManageInquiries, Permission::ManageApplications],
        };
    }
}
