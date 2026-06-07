<?php

namespace App\Support\Models\User;

use Illuminate\Http\Request;

class GetUserReqModel
{
    public ?string $name;

    public ?int $page;

    public ?int $limit;

    public function __construct(Request $request)
    {
        $this->name = $request->query('name');
        $this->page = $request->query('page');
        $this->limit = $request->query('limit');
    }
}
