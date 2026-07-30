<?php

namespace App\Http\Resources;

use App\Models\ProductReturn;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CapitalWalletTransactionResource extends JsonResource
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
            'amount' => (float) $this->amount,
            'type' => $this->type,
            'transaction_type' => $this->transaction_type,
            'balance_before' => (float) $this->balance_before,
            'balance_after' => (float) $this->balance_after,
            'notes' => $this->notes,
            'invoice_number' => match ($this->reference_type) {
                Transaction::class => $this->reference->invoice_number ?? '-',
                ProductReturn::class => $this->reference->transaction->invoice_number ?? '-',
                default => '-',
            },
            'created_at' => $this->getRawOriginal('created_at'),
            'updated_at' => $this->getRawOriginal('updated_at'),
        ];
    }
}
