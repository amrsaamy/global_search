<div class="global-search-container">
    <input type="text"
           id="{{ $input_id }}"
           placeholder="{{ $placeholder }}"
           class="global-search-input">

    <div id="{{ $results_id }}" class="global-search-results">
        <ul id="{{ $list_id }}"></ul>
    </div>
</div>

@push('scripts')
    @vite([
        'css/vendor/global_search/search.css',
        'js/vendor/global_search/search.js',
       
    ])
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            new GlobalSearch({
                inputId: '{{ $input_id }}',
                resultsId: '{{ $results_id }}',
                listId: '{{ $list_id }}',
                collections: @json(config('globalsearch.collections')),
                apiBase: '{{ config('globalsearch.api_endpoint') }}',
                debounceTime: {{ config('globalsearch.debounce') }}
            });
        });
    </script>
@endpush