<?php

namespace Theen\GlobalSearch;

use Statamic\Providers\AddonServiceProvider;
use Theen\GlobalSearch\Tags\GlobalSearch;

class ServiceProvider extends AddonServiceProvider
{
    protected $tags = [
        Tags\GlobalSearch::class
    ];

    protected $routes = [
        'cp' => __DIR__.'/../routes/cp.php'
    ];


    public function bootAddon()
    {
        $this->configureApi();

        $this->publishes([
            __DIR__.'/../resources/js' => resource_path('js/vendor/global_search'),
            __DIR__.'/../resources/js' => public_path('js/vendor/global_search'),
            __DIR__.'/../resources/css' => resource_path('css/vendor/global_search'),
            __DIR__.'/../resources/css' => public_path('css/vendor/global_search'),
        ], 'global-search-assets');

        $this->publishes([
            __DIR__.'/../resources/views' => resource_path('views/vendor/global-search'),
        ], 'global-search-views');

        $this->loadViewsFrom(__DIR__.'/../resources/views', 'global-search');
    }

    protected function configureApi()
    {
        // Merge configurations recursively without overwriting existing settings
        config()->set('statamic.api', array_replace_recursive(
            config('statamic.api', []),
            [
                'enabled' => true,
                'resources' => [
                    'collections' => [
                        '*' => [
                            'enabled' => true,
                            'allowed_filters' => ['title', 'published', 'locale'],
                        ],
                        'pages' => true
                    ]
                ]
            ]
        ));
    }
}
