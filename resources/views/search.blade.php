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
<link rel="stylesheet" href="css/vendor/global_search/search.css">
<script src="js/vendor/global_search/search.js"></script>
   
@endpush