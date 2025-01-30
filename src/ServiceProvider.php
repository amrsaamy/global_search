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
        $this->mergeConfigFrom(__DIR__.'/../config/globalsearch.php', 'globalsearch');
        
        $this->configureApi();
        $this->publishes([
            __DIR__.'/../config/globalsearch.php' => config_path('globalsearch.php'),
        ], 'global-search-config');
        $this->publishes([
            // __DIR__.'/../resources/js' => resource_path('js/vendor/global_search'),
            __DIR__.'/../resources/js' => public_path('js/vendor/global_search'),
            // __DIR__.'/../resources/css' => resource_path('css/vendor/global_search'),
            __DIR__.'/../resources/css' => public_path('css/vendor/global_search'),
        ], 'global-search-assets');

        $this->publishes([
            __DIR__.'/../resources/views' => resource_path('views/vendor/global-search'),
        ], 'global-search-views');

        $this->loadViewsFrom(__DIR__.'/../resources/views', 'global-search');
    }

    protected function configureApi()
    {
        // Only modify if global search API is enabled
        if (config('globalsearch.api.enabled', true)) {
            config([
                'statamic.api.enabled' => true,
                'statamic.api.resources.collections' => $this->mergeCollectionConfig()
            ]);
        }
    }

    protected function mergeCollectionConfig()
    {
        $existing = config('statamic.api.resources.collections', []);
        $modified = collect(config('globalsearch.collections', []))
            ->mapWithKeys(fn($col) => [
                $col => [
                    'allowed_filters' => array_merge(
                        $existing[$col]['allowed_filters'] ?? [],
                        ['title']
                    ),
                    'enabled' => true
                ]
            ])->toArray();
            if(is_bool($existing)){
                return $modified;
            }else if(is_array($existing)){
                return array_merge_recursive($existing, $modified);
            }
    }
}
