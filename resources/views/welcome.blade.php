@extends('layout.app')
@section('content')
    <div class="main container-md mt-2">
        <div id="app"></div>
    </div>
@endsection

@push('scripts')
    @vite('resources/js/page/home/home.ts')
@endpush
