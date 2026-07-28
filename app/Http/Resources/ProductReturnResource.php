<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductReturnResource extends JsonResource
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
            'return_number' => $this->return_number,
            'transaction_id' => $this->transaction_id,
            'invoice_number' => $this->transaction?->invoice_number,
            'user_id' => $this->user_id,
            'user_name' => $this->user?->name,
            'total_refund_amount' => $this->total_refund_amount,
            'reason' => $this->reason,
            'created_at' => $this->created_at ? $this->created_at->timestamp : null,
            'updated_at' => $this->updated_at ? $this->updated_at->timestamp : null,
            'details' => $this->details->map(fn ($detail) => [
                'id' => $detail->id,
                'product_id' => $detail->product_id,
                'product_name' => $detail->product?->name,
                'quantity' => $detail->quantity,
                'price_per_unit' => $detail->price_per_unit,
                'subtotal' => $detail->subtotal,
            ]),
        ];
    }
}
