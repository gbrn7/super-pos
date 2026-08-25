<?php

use App\Models\Product;
use App\Models\User;
use App\Support\Enums\RoleEnums;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->role = Role::firstOrCreate(['name' => RoleEnums::SUPER_ADMIN->value]);
    $this->user = User::factory()->create([
        'password' => bcrypt('correct-password'),
    ]);
    $this->user->assignRole($this->role);
});

test('data management settings page is displayed for super admin', function () {
    $response = $this
        ->actingAs($this->user)
        ->get(route('data-management.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('settings/data-management'));
});

test('non super admin cannot access data management settings page', function () {
    $regularUser = User::factory()->create();

    $response = $this
        ->actingAs($regularUser)
        ->get(route('data-management.edit'));

    $response->assertForbidden();
});

test('data purge requires valid password and modules', function () {
    $response = $this
        ->actingAs($this->user)
        ->from(route('data-management.edit'))
        ->post(route('data-management.purge'), [
            'modules' => [],
            'retention_period' => '6_months',
            'password' => 'wrong-password',
        ]);

    $response->assertSessionHasErrors(['modules', 'password']);
});

test('data purge deletes records older than cutoff date and retains newer ones', function () {
    $paymentMethodId = DB::table('payment_methods')->insertGetId([
        'name' => 'Cash',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $product1 = Product::factory()->create();
    $product2 = Product::factory()->create();

    // 1. Seed old and new records for transactions
    $oldTransactionId = DB::table('transactions')->insertGetId([
        'invoice_number' => 'INV-OLD-123',
        'user_id' => $this->user->id,
        'payment_method_id' => $paymentMethodId,
        'total_amount' => 1000,
        'discount_amount' => 0,
        'payment_amount' => 1000,
        'change_amount' => 0,
        'created_at' => now()->subMonths(7),
        'updated_at' => now()->subMonths(7),
    ]);

    DB::table('transaction_detail')->insert([
        'transaction_id' => $oldTransactionId,
        'product_id' => $product1->id,
        'price' => 1000,
        'quantity' => 1,
        'discount' => 0,
        'cost_price' => 500,
        'unit_name' => 'pcs',
        'created_at' => now()->subMonths(7),
        'updated_at' => now()->subMonths(7),
    ]);

    $newTransactionId = DB::table('transactions')->insertGetId([
        'invoice_number' => 'INV-NEW-456',
        'user_id' => $this->user->id,
        'payment_method_id' => $paymentMethodId,
        'total_amount' => 2000,
        'discount_amount' => 0,
        'payment_amount' => 2000,
        'change_amount' => 0,
        'created_at' => now()->subMonths(5),
        'updated_at' => now()->subMonths(5),
    ]);

    DB::table('transaction_detail')->insert([
        'transaction_id' => $newTransactionId,
        'product_id' => $product2->id,
        'price' => 2000,
        'quantity' => 1,
        'discount' => 0,
        'cost_price' => 1000,
        'unit_name' => 'pcs',
        'created_at' => now()->subMonths(5),
        'updated_at' => now()->subMonths(5),
    ]);

    // 2. Perform purge request for transactions older than 6 months
    $response = $this
        ->actingAs($this->user)
        ->post(route('data-management.purge'), [
            'modules' => ['transactions'],
            'retention_period' => '6_months',
            'password' => 'correct-password',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('data-management.edit'));

    // 3. Assert old transaction and detail are deleted
    $this->assertDatabaseMissing('transactions', ['id' => $oldTransactionId]);
    $this->assertDatabaseMissing('transaction_detail', ['transaction_id' => $oldTransactionId]);

    // 4. Assert new transaction and detail are retained
    $this->assertDatabaseHas('transactions', ['id' => $newTransactionId]);
    $this->assertDatabaseHas('transaction_detail', ['transaction_id' => $newTransactionId]);
});
