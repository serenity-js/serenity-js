import { Expectation } from '@serenity-js/core';

import { equals } from './equals';

export function isFalse(): Expectation<boolean> {
    return Expectation.to<boolean>(`equal false`).soThatActual(equals(false));
}
