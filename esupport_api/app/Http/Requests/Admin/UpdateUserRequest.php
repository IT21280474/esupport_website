<?php

namespace App\Http\Requests\Admin;

use App\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:200'],
            'role' => ['sometimes', 'required', Rule::enum(Role::class)],
            'is_active' => ['sometimes', 'boolean'],
            'password' => ['nullable', 'string', 'max:200', Password::min(8)],
        ];
    }
}
