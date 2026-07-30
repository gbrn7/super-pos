<?php

use App\Models\Category;
use App\Models\PaymentMethod;
use App\Models\Permission;
use App\Models\Product;
use App\Models\ProductReturn;
use App\Models\ReturnDetail;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use App\Support\Enums\DashboardPermissionEnums;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('dashboard reflects returned items correctly', function () {
    $user = User::factory()->create();
    Permission::create(['name' => DashboardPermissionEnums::READ_DASHBOARD->value]);
    $user->givePermissionTo(DashboardPermissionEnums::READ_DASHBOARD->value);

    $paymentMethod = PaymentMethod::factory()->create(['name' => 'Cash']);
    $category = Category::factory()->create(['name' => 'Electronics']);

    $product = Product::factory()->create([
        'name' => 'Laptop',
        'category_id' => $category->id,
        'price' => 1000.00,
        'cost_price' => 600.00,
        'stock' => 10,
        'sold_quantity' => 2,
    ]);

    // Create transaction
    $transaction = Transaction::create([
        'user_id' => $user->id,
        'payment_method_id' => $paymentMethod->id,
        'invoice_number' => 'INV-001',
        'total_amount' => 2000.00,
        'payment_amount' => 2000.00,
        'change_amount' => 0.00,
        'discount_amount' => 0.00,
        'created_at' => Carbon::now()->unix(),
    ]);

    TransactionDetail::create([
        'transaction_id' => $transaction->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'price' => 1000.00,
        'cost_price' => 600.00,
        'discount' => 0.00,
        'unit_name' => 'pcs',
    ]);

    // Process a return for 1 quantity
    $productReturn = ProductReturn::create([
        'return_number' => 'RET-001',
        'transaction_id' => $transaction->id,
        'user_id' => $user->id,
        'total_refund_amount' => 1000.00,
        'reason' => 'Defective',
        'created_at' => Carbon::now()->unix(),
        'updated_at' => Carbon::now()->unix(),
    ]);

    ReturnDetail::create([
        'return_id' => $productReturn->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'price_per_unit' => 1000.00,
        'subtotal' => 1000.00,
        'created_at' => Carbon::now()->unix(),
        'updated_at' => Carbon::now()->unix(),
    ]);

    // Adjust sold_quantity
    $product->decrement('sold_quantity', 1);

    $response = $this->actingAs($user)
        ->getJson(route('apiDashboard.index'));

    $response->assertStatus(200);
    $data = $response->json('data');

    // Verify metrics: total_revenue (2000 - 1000 = 1000), total_cost (1200 - 600 = 600)
    expect($data['metrics']['total_revenue'])->toEqual(1000.00);
    expect($data['metrics']['total_net_profit'])->toEqual(400.00); // 1000 - 600
    expect($data['metrics']['products_sold'])->toEqual(1);

    // Verify top products contains the product with net quantity 1
    expect($data['top_products'][0]['name'])->toEqual('Laptop');
    expect($data['top_products'][0]['quantity'])->toEqual(1);

    // Verify payment method has total_amount of 1000 (2000 - 1000 refund)
    expect($data['transactions_by_payment_method'][0]['total_amount'])->toEqual(1000.00);

    // Verify category has total_amount of 1000 and products_count of 1
    expect($data['transactions_by_category'][0]['total_amount'])->toEqual(1000.00);
    expect($data['transactions_by_category'][0]['products_count'])->toEqual(1);
});
