<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionDetailResource extends JsonResource
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
            'transaction_id' => $this->transaction_id,
            'product_id' => $this->product_id,
            'product_name' => $this->whenLoaded('product', fn () => $this->product->name),
            'unit_name' => $this->unit_name,
            'quantity' => $this->quantity,
            'cost_price' => $this->cost_price,
            'price' => $this->price,
            'discount' => $this->discount,
            'subtotal' => ($this->price - $this->discount) * $this->quantity,
            'returned_quantity' => $this->when(
                $this->transaction && $this->transaction->relationLoaded('returns'),
                fn () => $this->transaction->returns->flatMap->details->where('product_id', $this->product_id)->sum('quantity')
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
