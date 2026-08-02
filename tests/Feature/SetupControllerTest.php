<?php

use Illuminate\Support\Facades\Config;

beforeEach(function () {
    Config::set('app.installed', false);
});

test('setup index page renders correctly', function () {
    $response = $this->get(route('setup.index'));

    $response->assertStatus(200);
});

test('test-db endpoint returns database connection status', function () {
    $response = $this->postJson(route('setup.test-db'));

    $response->assertOk()->assertJson(['success' => true]);
});

test('test-db endpoint accepts and updates DB credentials', function () {
    $payload = [
        'db_connection' => 'sqlite',
        'db_database' => ':memory:',
    ];

    $response = $this->postJson(route('setup.test-db'), $payload);

    $response->assertOk()->assertJson(['success' => true]);
});

test('complete endpoint creates owner account and marks app installed', function () {
    $payload = [
        'store_name' => 'My POS Store',
        'store_address' => 'Jl. Merdeka No 1',
        'store_phone' => '081234567890',
        'currency' => 'Rp',
        'timezone' => 'Asia/Jakarta',
        'name' => 'Owner POS',
        'email' => 'owner@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ];

    $response = $this->post(route('setup.complete'), $payload);

    $response->assertRedirect('/dashboard');
    $this->assertDatabaseHas('users', ['email' => 'owner@example.com']);
    $this->assertAuthenticated();
});
