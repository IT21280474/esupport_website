<?php

namespace App\Support\Media;

use RuntimeException;

/**
 * A user-facing problem with an upload or screenshot (shown as a 422 message).
 */
class MediaException extends RuntimeException {}
