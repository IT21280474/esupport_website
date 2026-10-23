<x-mail::message>
# New job application

**Position:** {{ $application->position }}<br>
**Name:** {{ $application->name }}<br>
**Email:** {{ $application->email }}<br>
**Phone:** {{ $application->phone }}

@if ($application->message)
<x-mail::panel>
{{ $application->message }}
</x-mail::panel>
@endif

The CV is stored securely and can be downloaded from the admin panel.

<x-mail::button :url="$adminUrl">
Review application
</x-mail::button>

{{ config('app.name') }}
</x-mail::message>
