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
        // Enable API and configure collections
        config([
            'statamic.api.enabled' => true,
            'statamic.api.resources.collections' => [
                '*' => [
                    'enabled' => true,
                    'allowed_filters' => ['title'],
                ],
                'pages' => true
            ],
        ]);

        // Merge with existing configuration to preserve other settings
        config()->set('statamic.api', array_merge(
            config('statamic.api', []),
            [
                'resources' => array_merge(
                    config('statamic.api.resources', []),
                    [
                        'collections' => array_merge(
                            config('statamic.api.resources.collections', []),
                            [
                                '*' => [
                                    'enabled' => true,
                                    'allowed_filters' => ['title'],
                                ],
                                'pages' => true
                            ]
                        )
                    ]
                )
            ]
        ));
    }
}
