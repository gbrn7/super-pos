<?php

namespace App\Support\Utils;

use App\Support\Constants\Header;

class MessageResponse
{
    public static function make(
        string $key,
        array $replace = [],
        ?string $defaultResource = 'Data',
        ?string $fallbackMessage = null,
    ): string {
        $replace['resource'] ??= $defaultResource;

        $message = trans($key, $replace);

        if ($message === $key) {
            $message = trans($key, $replace, Header::X_LANGUAGE_DEFAULT_VALUE);

            dd($message);

            if ($message === $key && isset($fallbackMessage)) {
                return $fallbackMessage;
            }
        }

        return $message;
    }
}
