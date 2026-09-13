<?php

use App\Models\User;

test('guest cannot access hpp calculator', function () {
    $response = $this->get(route('hpp-calculator'));

    $response->assertRedirect(route('login'));
});

test('authenticated user can access hpp calculator', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('hpp-calculator'));

    $response->assertStatus(200);
});
