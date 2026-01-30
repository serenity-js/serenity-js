import { configure, Duration } from '@serenity-js/core';
import { beforeEach } from 'mocha';

beforeEach(() => configure({
    interactionTimeout: Duration.ofMilliseconds(500)
}));
