<?php

namespace App\Support\Utils;

use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class CheckException
{
    public static function Check(\Throwable $th): \Throwable
    {
        // Log the error
        Log::error($th->getMessage(), [
            'exception' => $th,
        ]);

        $code = $th->getCode();

        if (
            ! is_int($code) ||
            $code < 100 ||
            $code > 599
        ) {
            return new Exception(
                trans('message.error.internal_server_error'),
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        return $th;
    }
}
