<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
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
            'user_id' => $this->user_id,
            'user_name' => $this->whenLoaded('user', fn () => $this->user->name),
            'payment_method_id' => $this->payment_method_id,
            'payment_method_name' => $this->whenLoaded('paymentMethod', fn () => $this->paymentMethod->name),
            'invoice_number' => $this->invoice_number,
            'total_amount' => $this->total_amount,
            'discount_amount' => $this->discount_amount,
            'payment_amount' => $this->payment_amount,
            'change_amount' => $this->change_amount,
            'details' => TransactionDetailResource::collection($this->whenLoaded('transactionDetails')),
            'created_at' => $this->getRawOriginal('created_at'),
            'updated_at' => $this->getRawOriginal('updated_at'),
        ];
    }
}
