<?php

namespace Theen\GlobalSearch\Tests;

use Theen\GlobalSearch\ServiceProvider;
use Statamic\Testing\AddonTestCase;

abstract class TestCase extends AddonTestCase
{
    protected string $addonServiceProvider = ServiceProvider::class;
}
