<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request)
    {
        // For Inertia/XHR requests use Inertia::location so the client navigates.
        if ($request->wantsJson() || $request->header('X-Inertia')) {
            return Inertia::location('/tasks');
        }

        return redirect()->intended('/tasks');
    }
}
