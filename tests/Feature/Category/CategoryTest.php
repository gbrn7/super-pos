<?php

use App\Models\Category;
use App\Models\User;

function getUser()
{
    return User::factory()->create();
}

test('category page is displayed', function () {

    $response = $this
        ->actingAs(getUser())
        ->getJson(route('categories.index'));

    $response->assertOk();
});

test('get category', function () {
    Category::factory()->create();

    $response = $this
        ->actingAs(getUser())
        ->getJson(route('apiCategories.index'));

    $response
        ->assertSessionHasNoErrors()
        ->assertOk();
});

test('create category', function () {
    $response = $this
        ->actingAs(getUser())
        ->postJson(route('apiCategories.store'), [
            'name' => fake()->unique()->word(),
            'desc' => fake()->sentence(),
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertCreated();
});

test('create category with duplicate name', function () {
    $category = Category::factory()->create();

    $response = $this
        ->actingAs(getUser())
        ->postJson(route('apiCategories.store'), [
            'name' => $category->name,
            'desc' => $category->desc,
        ]);

    $response
        ->assertUnprocessable() // 422 http code validation
        ->assertJsonValidationErrors([
            'name',
        ]);
});

test('update category', function () {
    $category = Category::factory()->create();

    $response = $this
        ->actingAs(getUser())
        ->putJson(route('apiCategories.update', $category->id), [
            'name' => fake()->unique()->word(),
            'desc' => fake()->sentence(),
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertOk();
});

test('update category with duplicate name', function () {
    $category = Category::factory()->create();
    $category2 = Category::factory()->create();

    $response = $this
        ->actingAs(getUser())
        ->putJson(route('apiCategories.update', $category->id), [
            'name' => $category2->name,
            'desc' => $category2->desc,
        ]);

    $response->assertUnprocessable(); // 422 http code validation
});

test('delete category', function () {
    $category = Category::factory()->create();

    $response = $this
        ->actingAs(getUser())
        ->deleteJson(route('apiCategories.destroy', $category->id));

    $response
        ->assertSessionHasNoErrors()
        ->assertOk();
});

test('delete bulk category', function () {
    $categories = Category::factory(5)->create();

    $categoryIds = $categories->pluck('id')->toArray();

    $response = $this
        ->actingAs(getUser())
        ->postJson(route('apiCategories.bulkDelete'), [
            'ids' => $categoryIds,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertOk();
});
