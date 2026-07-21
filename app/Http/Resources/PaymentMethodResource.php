<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentMethodResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'desc' => $this->desc,
            'image' => isset($this->image) ? asset('storage/'.$this->image) : null,
            'created_at' => $this->getRawOriginal('created_at'),
            'updated_at' => $this->getRawOriginal('updated_at'),
        ];
    }
}
