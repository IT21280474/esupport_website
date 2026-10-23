<?php

namespace Tests\Concerns;

use Illuminate\Http\UploadedFile;

trait MakesUploads
{
    /**
     * A real upload whose MIME type is sniffed from its contents rather than
     * its name (UploadedFile::fake() derives the MIME type from the name).
     */
    protected static function realUpload(string $name, string $contents): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'upload');
        file_put_contents($path, $contents);

        return new UploadedFile($path, $name, null, null, true);
    }
}
