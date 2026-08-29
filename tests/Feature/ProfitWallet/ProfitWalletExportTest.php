<?php

namespace Tests\Feature\ProfitWallet;

use App\Models\Permission;
use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfitWalletExportTest extends TestCase
{
    use RefreshDatabase;

    protected User $authorizedUser;

    protected User $unauthorizedUser;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::create(['name' => 'read-profit-wallet']);

        $this->authorizedUser = User::factory()->create();
        $this->authorizedUser->givePermissionTo('read-profit-wallet');

        $this->unauthorizedUser = User::factory()->create();
    }

    public function test_authorized_user_can_export_profit_wallet_to_excel()
    {
        $wallet = ProfitWallet::factory()->create(['balance' => 1000]);
        ProfitWalletTransaction::factory()->create([
            'profit_wallet_id' => $wallet->id,
            'amount' => 100,
            'type' => 'in',
            'transaction_type' => 'sales_profit',
            'balance_before' => 900,
            'balance_after' => 1000,
        ]);

        $response = $this->actingAs($this->authorizedUser)
            ->getJson(route('apiProfitWallet.exportData', ['format' => 'excel']));

        $response->assertStatus(200);
        $this->assertTrue(
            str_contains($response->headers->get('content-type'), 'vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        );
    }

    public function test_authorized_user_can_export_profit_wallet_to_pdf()
    {
        $wallet = ProfitWallet::factory()->create(['balance' => 1000]);
        ProfitWalletTransaction::factory()->create([
            'profit_wallet_id' => $wallet->id,
            'amount' => 100,
            'type' => 'in',
            'transaction_type' => 'sales_profit',
            'balance_before' => 900,
            'balance_after' => 1000,
        ]);

        $response = $this->actingAs($this->authorizedUser)
            ->getJson(route('apiProfitWallet.exportData', ['format' => 'pdf']));

        $response->assertStatus(200);
        $this->assertTrue(
            str_contains($response->headers->get('content-type'), 'pdf')
        );
    }

    public function test_unauthorized_user_cannot_export_profit_wallet()
    {
        $response = $this->actingAs($this->unauthorizedUser)
            ->getJson(route('apiProfitWallet.exportData', ['format' => 'excel']));

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_export_profit_wallet_with_limit_greater_than_100()
    {
        $wallet = ProfitWallet::factory()->create(['balance' => 1000]);
        ProfitWalletTransaction::factory()->create([
            'profit_wallet_id' => $wallet->id,
            'amount' => 100,
            'type' => 'in',
            'transaction_type' => 'sales_profit',
            'balance_before' => 900,
            'balance_after' => 1000,
        ]);

        $response = $this->actingAs($this->authorizedUser)
            ->getJson(route('apiProfitWallet.exportData', ['format' => 'excel', 'limit' => 1000]));

        $response->assertStatus(200);
        $this->assertTrue(
            str_contains($response->headers->get('content-type'), 'vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        );
    }
}
