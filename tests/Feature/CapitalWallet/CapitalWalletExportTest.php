<?php

namespace Tests\Feature\CapitalWallet;

use App\Models\CapitalWallet;
use App\Models\CapitalWalletTransaction;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CapitalWalletExportTest extends TestCase
{
    use RefreshDatabase;

    protected User $authorizedUser;

    protected User $unauthorizedUser;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::create(['name' => 'read-capital-wallet']);

        $this->authorizedUser = User::factory()->create();
        $this->authorizedUser->givePermissionTo('read-capital-wallet');

        $this->unauthorizedUser = User::factory()->create();
    }

    public function test_authorized_user_can_export_capital_wallet_to_excel()
    {
        $wallet = CapitalWallet::factory()->create(['balance' => 1000]);
        CapitalWalletTransaction::factory()->create([
            'capital_wallet_id' => $wallet->id,
            'amount' => 100,
            'type' => 'in',
            'transaction_type' => 'capital_injection',
            'balance_before' => 900,
            'balance_after' => 1000,
        ]);

        $response = $this->actingAs($this->authorizedUser)
            ->getJson(route('apiCapitalWallet.exportData', ['format' => 'excel']));

        $response->assertStatus(200);
        $this->assertTrue(
            str_contains($response->headers->get('content-type'), 'vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        );
    }

    public function test_authorized_user_can_export_capital_wallet_to_pdf()
    {
        $wallet = CapitalWallet::factory()->create(['balance' => 1000]);
        CapitalWalletTransaction::factory()->create([
            'capital_wallet_id' => $wallet->id,
            'amount' => 100,
            'type' => 'in',
            'transaction_type' => 'capital_injection',
            'balance_before' => 900,
            'balance_after' => 1000,
        ]);

        $response = $this->actingAs($this->authorizedUser)
            ->getJson(route('apiCapitalWallet.exportData', ['format' => 'pdf']));

        $response->assertStatus(200);
        $this->assertTrue(
            str_contains($response->headers->get('content-type'), 'pdf')
        );
    }

    public function test_unauthorized_user_cannot_export_capital_wallet()
    {
        $response = $this->actingAs($this->unauthorizedUser)
            ->getJson(route('apiCapitalWallet.exportData', ['format' => 'excel']));

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_export_capital_wallet_with_limit_greater_than_100()
    {
        $wallet = CapitalWallet::factory()->create(['balance' => 1000]);
        CapitalWalletTransaction::factory()->create([
            'capital_wallet_id' => $wallet->id,
            'amount' => 100,
            'type' => 'in',
            'transaction_type' => 'capital_injection',
            'balance_before' => 900,
            'balance_after' => 1000,
        ]);

        $response = $this->actingAs($this->authorizedUser)
            ->getJson(route('apiCapitalWallet.exportData', ['format' => 'excel', 'limit' => 1000]));

        $response->assertStatus(200);
        $this->assertTrue(
            str_contains($response->headers->get('content-type'), 'vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        );
    }
}
