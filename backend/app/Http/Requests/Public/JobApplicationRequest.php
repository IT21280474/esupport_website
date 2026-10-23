<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class JobApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:190'],
            'phone' => ['required', 'string', InquiryRequest::PHONE_RULE],
            'career_id' => ['nullable', 'integer', 'exists:careers,id'],
            'position' => ['required', 'string', 'max:190'],
            'message' => ['nullable', 'string', 'max:5000'],
            // MIME is checked from file contents, not just the extension
            'cv' => [
                'required',
                File::types(config('muthumala.uploads.cv_mimes'))->max(config('muthumala.uploads.cv_max_kb')),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Please enter a valid phone number.',
            'cv.required' => 'Please attach your CV.',
            'cv.mimes' => 'Your CV must be a PDF or Word document.',
            'cv.max' => 'Your CV must be under 5 MB.',
        ];
    }
}
