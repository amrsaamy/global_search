<?php

namespace Theen\GlobalSearch\Tags;

use Statamic\Tags\Tags;

class GlobalSearch extends Tags
{
    public function index()
    {
        $locale = app()->getLocale();

        return view('global-search::search', [
            'input_id' => 'global-search-input',
            'results_id' => 'global-search-results',
            'list_id' => 'global-search-results-list',
            'placeholder' => config("globalsearch.placeholder.$locale", 'Search...')
        ]);
    }
}
