<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'category_id' => $this->category_id,
            'unit_id' => $this->unit_id,
            'name' => $this->name,
            'is_active' => $this->is_active,
            'stock' => $this->stock,
            'price' => $this->price,
            'cost_price' => $this->cost_price,
            'image' => isset($this->image) ? asset('storage/'.$this->image) : null,
            'created_at' => $this->getRawOriginal('created_at'),
            'updated_at' => $this->getRawOriginal('updated_at'),
        ];
    }
}
