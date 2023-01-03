import { PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, TestType } from '@playwright/test';

import { SerenityFixtures } from './SerenityFixtures';
import { SerenityOptions } from './SerenityOptions';

/* eslint-disable @typescript-eslint/indent */
export type SerenityTestType =
    TestType<
        PlaywrightTestArgs & PlaywrightTestOptions & Omit<SerenityOptions, 'actors'> & SerenityFixtures,
        PlaywrightWorkerArgs & PlaywrightWorkerOptions
    >;
/* eslint-enable @typescript-eslint/indent */
