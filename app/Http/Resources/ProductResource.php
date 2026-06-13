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
            'name' => $this->name,
            'sku' => $this->sku,
            'category_id' => $this->category_id,
            'category_name' => $this->category->name,
            'unit_id' => $this->unit_id,
            'unit_name' => $this->unit->name,
            'is_active' => $this->is_active,
            'is_unlimited' => $this->is_unlimited,
            'stock' => $this->stock,
            'price' => $this->price,
            'cost_price' => $this->cost_price,
            'desc' => $this->desc,
            'image' => isset($this->image) ? asset('storage/' . $this->image) : null,
            'created_at' => $this->getRawOriginal('created_at'),
            'updated_at' => $this->getRawOriginal('updated_at'),
        ];
    }
}
