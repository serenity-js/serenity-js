import { Answerable, Expectation, Optional } from '@serenity-js/core';

/**
 * @desc
 *  Expectation that the `actual` is not undefined or null.
 *  Also, for `actual` implementing {@link @serenity-js/core/lib/screenplay~Optional}, that `Optional.isPresent()` returns an {@link @serenity-js/core/lib/screenplay~Answerable}
 *  that resolves to `true`
 *
 * @returns {@serenity-js/core/lib/screenplay/questions~Expectation<Answerable<boolean>, Optional>}
 *
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/core/lib/screenplay/questions~Check}
 * @see {@link Wait}
 */
export function isPresent(): Expectation<Answerable<boolean>, any> {
    return Expectation.thatActualShould<Answerable<boolean>, any>(`become present`, true)
        .soThat((actualValue, expectedValue) => {
            if (actualValue === undefined || actualValue === null) {
                return false;
            }

            if (isOptional(actualValue)) {
                return actualValue.isPresent();
            }

            return true;
        })
        .describedAs('become present');
}

function isOptional(value: any): value is Optional {
    if (typeof value === 'object' && Reflect.has(value, 'isPresent')) {
        return value.isPresent();
    }
}
