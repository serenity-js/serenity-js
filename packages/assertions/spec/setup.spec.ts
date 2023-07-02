import { configure, Duration } from '@serenity-js/core';
import { beforeEach } from 'mocha';

// eslint-disable-next-line mocha/no-top-level-hooks
beforeEach(() => configure({
    interactionTimeout: Duration.ofMilliseconds(500)
}));
