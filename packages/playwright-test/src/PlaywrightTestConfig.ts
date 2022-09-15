import type { PlaywrightTestConfig as BasePlaywrightTestConfig } from '@playwright/test';
import { SerenityConfig } from '@serenity-js/core';

export type PlaywrightTestConfig<BaseConfig extends BasePlaywrightTestConfig = BasePlaywrightTestConfig> = Omit<BaseConfig, 'use'> & {
    use?: BaseConfig['use'] & SerenityConfig
};
