<?php

namespace Tests\Feature\Setup;

use Tests\TestCase;

class DesktopSetupTest extends TestCase
{
    public function test_run_migration_initializes_sqlite_database_successfully(): void
    {
        $response = $this->postJson('/setup/migrate');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }
}
