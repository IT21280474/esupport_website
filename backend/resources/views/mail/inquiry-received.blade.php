<x-mail::message>
# {{ $inquiry->type->label() }}

**Business area:** {{ $inquiry->business_area->label() }}<br>
**Name:** {{ $inquiry->name }}<br>
@if ($inquiry->email)
**Email:** {{ $inquiry->email }}<br>
@endif
@if ($inquiry->phone)
**Phone:** {{ $inquiry->phone }}<br>
@endif
@if ($inquiry->subject)
**Subject:** {{ $inquiry->subject }}<br>
@endif
@foreach ($inquiry->meta ?? [] as $label => $value)
@if (filled($value))
**{{ \Illuminate\Support\Str::headline($label) }}:** {{ $value }}<br>
@endif
@endforeach

@if ($inquiry->message)
<x-mail::panel>
{{ $inquiry->message }}
</x-mail::panel>
@endif

<x-mail::button :url="$adminUrl">
Open in admin
</x-mail::button>

{{ config('app.name') }}
</x-mail::message>
