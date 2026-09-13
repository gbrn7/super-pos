<?php

namespace Tests\Feature\ProfitWallet;

use App\Models\Permission;
use App\Models\ProfitWallet;
use App\Models\ProfitWalletTransaction;
use App\Models\User;
use App\Support\Interfaces\Services\ProfitWalletServiceInterface;
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

    public function test_export_filename_includes_date_range_when_specified()
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

        $responsePdf = $this->actingAs($this->authorizedUser)
            ->get(route('apiProfitWallet.exportData', [
                'format' => 'pdf',
                'start_date' => '2026-08-01',
                'end_date' => '2026-08-31',
            ]));

        $responsePdf->assertStatus(200);
        $this->assertStringContainsString(
            'laporan-dompet-profit-2026-08-01-sd-2026-08-31.pdf',
            $responsePdf->headers->get('content-disposition') ?? ''
        );

        $responseExcel = $this->actingAs($this->authorizedUser)
            ->get(route('apiProfitWallet.exportData', [
                'format' => 'excel',
                'start_date' => '2026-08-01',
                'end_date' => '2026-08-01',
            ]));

        $responseExcel->assertStatus(200);
        $this->assertStringContainsString(
            'laporan-dompet-profit-2026-08-01.xlsx',
            $responseExcel->headers->get('content-disposition') ?? ''
        );
    }

    public function test_authorized_user_can_export_profit_wallet_with_records_to_pdf()
    {
        $wallet = ProfitWallet::factory()->create(['balance' => 1000]);
        ProfitWalletTransaction::factory()->count(10)->create([
            'profit_wallet_id' => $wallet->id,
            'amount' => 100,
            'type' => 'in',
            'transaction_type' => 'sales_profit',
            'balance_before' => 900,
            'balance_after' => 1000,
        ]);

        $response = $this->actingAs($this->authorizedUser)
            ->get(route('apiProfitWallet.exportData', ['format' => 'pdf']));

        $response->assertStatus(200);
        $this->assertTrue(str_contains($response->headers->get('content-type'), 'pdf'));
    }

    public function test_export_pdf_returns_422_if_profit_wallet_transaction_count_exceeds_limit()
    {
        $wallet = ProfitWallet::factory()->create(['balance' => 1000]);
        $mockService = \Mockery::mock(ProfitWalletServiceInterface::class);
        $mockService->shouldReceive('export')
            ->once()
            ->andThrow(new \Exception('Jumlah data terlalu banyak untuk ekspor PDF (2.500 data). Maksimal data yang dapat diekspor ke PDF adalah 2.000 data. Silakan persempit filter tanggal atau gunakan format Excel.', 422));

        $this->app->instance(ProfitWalletServiceInterface::class, $mockService);

        $response = $this->actingAs($this->authorizedUser)
            ->getJson(route('apiProfitWallet.exportData', ['format' => 'pdf']));

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
        ]);
        $this->assertStringContainsString('2.500', $response->json('message'));
    }
}
