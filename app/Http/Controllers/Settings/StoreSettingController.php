<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreSettingUpdateRequest;
use App\Models\StoreSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreSettingController extends Controller
{
    public function edit(Request $request): Response
    {
        $storeSetting = StoreSetting::first() ?? new StoreSetting([
            'name' => 'Super POS',
            'address' => '-',
            'phone' => '-',
        ]);

        return Inertia::render('settings/store', [
            'storeSetting' => $storeSetting,
        ]);
    }

    public function update(StoreSettingUpdateRequest $request): RedirectResponse
    {
        $storeSetting = StoreSetting::first();

        if (!$storeSetting) {
            $storeSetting = new StoreSetting();
        }

        $storeSetting->fill($request->validated());
        $storeSetting->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => trans('message.success.store_settings_updated'),
        ]);

        return to_route('store.edit');
    }
}
