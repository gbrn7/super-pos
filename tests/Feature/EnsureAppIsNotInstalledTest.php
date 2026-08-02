<?php

use Illuminate\Support\Facades\Config;

test('redirects uninstalled app to setup route', function () {
    Config::set('app.installed', false);

    $response = $this->get('/');

    $response->assertRedirect(route('setup.index'));
});

test('allows setup route when app is not installed', function () {
    Config::set('app.installed', false);

    $response = $this->get(route('setup.index'));

    $response->assertStatus(200);
});

test('redirects setup route to dashboard when app is already installed', function () {
    Config::set('app.installed', true);

    $response = $this->get(route('setup.index'));

    $response->assertRedirect('/dashboard');
});
