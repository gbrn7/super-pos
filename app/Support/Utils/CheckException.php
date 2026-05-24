<?php

namespace App\Support\Utils;

use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CheckException
{
  public static function Check(Exception $th): Exception
  {
    //Log the error
    Log::error('Error', [
      'message' => $th->getMessage(),
      'code' => $th->getCode(),
    ]);

    $code = $th->getCode();

    if (
      !is_int($code) ||
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
