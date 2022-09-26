import type { PlaywrightTestConfig as BasePlaywrightTestConfig } from '@playwright/test';
import { ClassDescription } from '@serenity-js/core';

export type PlaywrightTestConfig<BaseConfig extends BasePlaywrightTestConfig = BasePlaywrightTestConfig> = Omit<BaseConfig, 'use' | 'reporter'> & {
    use?: BaseConfig['use'] & { crew: Array<ClassDescription> }
};
