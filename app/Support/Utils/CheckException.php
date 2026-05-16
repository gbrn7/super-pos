<?php

namespace App\Support\Utils;

use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class CheckException
{
  public static function Check(Exception $th): Exception
  {
    //Log the error
    Log::error('Error', [
      'message' => $th->getMessage(),
      'code' => $th->getCode(),
    ]);


    //check if code is 0 the message is cannot be displayed like sql error
    $th = $th->getCode() != 0 ? $th : throw new Exception(trans('message.error.internal_server_error'), Response::HTTP_INTERNAL_SERVER_ERROR);

    return $th;
  }
}
