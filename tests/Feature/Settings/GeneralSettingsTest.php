<?php

namespace Tests\Feature\Settings;

use App\Models\GeneralSetting;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class GeneralSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_settings_page_can_be_rendered()
    {
        $role = Role::create(['role_name' => 'Admin']);
        $user = User::factory()->create();
        $user->roles()->attach($role->id);

        $response = $this->actingAs($user)->get(route('admin.settings.edit'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/Settings')
            ->has('settings')
        );
    }

    public function test_settings_can_be_updated()
    {
        $role = Role::create(['role_name' => 'Admin']);
        $user = User::factory()->create();
        $user->roles()->attach($role->id);

        $response = $this->actingAs($user)->put(route('admin.settings.update'), [
            'theme_primary_color' => '#FF0000',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('general_settings', [
            'theme_primary_color' => '#FF0000',
        ]);
    }

    public function test_settings_update_validation()
    {
        $role = Role::create(['role_name' => 'Admin']);
        $user = User::factory()->create();
        $user->roles()->attach($role->id);

        $response = $this->actingAs($user)->put(route('admin.settings.update'), [
            'theme_primary_color' => 'invalid-color',
        ]);

        $response->assertSessionHasErrors('theme_primary_color');
    }
}
