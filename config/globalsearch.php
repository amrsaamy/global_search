<?php

return [
    'collections' => ['experience', 'place', 'pages'], // Collections to search
    'api' => [
        'enabled' => env('GLOBAL_SEARCH_API_ENABLED', true),
        'allowed_filters' => ['title', 'published', 'locale'],
        'route' => env('GLOBAL_SEARCH_API_ROUTE', '/api/collections')
    ],
    'search' => [
        'debounce' => 300, // Milliseconds
        'max_results' => 15
    ]
];