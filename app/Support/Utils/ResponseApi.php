<?php

namespace App\Support\Utils;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class ResponseApi
{
  public static function make(
    bool $isSuccess,
    string $message,
    mixed $data = null,
    ?int $httpCode = Response::HTTP_OK
  ): JsonResponse {

    if (!isset($httpCode) && !$isSuccess) {
      $httpCode = Response::HTTP_INTERNAL_SERVER_ERROR;
    }

    return response()->json([
      'success' => $isSuccess,
      'message' => $message,
      'data' => $data,
    ], $httpCode);
  }


  public static function download(
    string $fileName,
    string $publiFilePath,
  ): BinaryFileResponse {
    return response()->download(
      public_path($publiFilePath),
      $fileName
    );
  }
}
