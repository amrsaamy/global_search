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
        $this->publishes([
            __DIR__.'/../config/globalsearch.php' => config_path('globalsearch.php'),
        ], 'global-search-config');

        $this->publishes([
            __DIR__.'/../resources/js' => public_path('vendor/global-search/js'),
            __DIR__.'/../resources/css' => public_path('vendor/global-search/css'),
        ], 'global-search-assets');

        $this->publishes([
            __DIR__.'/../resources/views' => resource_path('views/vendor/global-search'),
        ], 'global-search-views');

        $this->loadViewsFrom(__DIR__.'/../resources/views', 'global-search');
    }
}
