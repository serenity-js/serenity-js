import type { PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, TestType } from '@playwright/test';

import type { SerenityFixtures } from './SerenityFixtures';
import type { SerenityOptions } from './SerenityOptions';

/* eslint-disable @typescript-eslint/indent */
export type SerenityTestType =
    TestType<
        PlaywrightTestArgs & PlaywrightTestOptions & Omit<SerenityOptions, 'actors'> & SerenityFixtures,
        PlaywrightWorkerArgs & PlaywrightWorkerOptions
    >;
/* eslint-enable @typescript-eslint/indent */
