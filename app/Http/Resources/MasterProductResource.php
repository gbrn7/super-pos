<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MasterProductResource extends JsonResource
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
            'barcode' => $this->barcode,
            'category_name' => $this->category_name,
            'unit_name' => $this->unit_name,
            'stock' => $this->stock,
            'price' => $this->price,
            'cost_price' => $this->cost_price,
            'desc' => $this->desc,
            'created_at' => $this->getRawOriginal('created_at'),
            'updated_at' => $this->getRawOriginal('updated_at'),
        ];
    }
}
