import { Answerable, Expectation } from '@serenity-js/core';
import { AssertionError } from 'chai';
import { equal } from 'tiny-types/lib/objects'; // tslint:disable-line:no-submodule-imports

export function containInAnyOrder(expected: Answerable<any[]>, sortByProperty = ''): Expectation<any[]> {
    if (typeof(expected[0]) !== 'object') {
        return Expectation.thatActualShould<any[], any[]>('contain all items in any order from', expected)
            .soThat((actualValue, expectedValue) => equal(actualValue.sort(), expectedValue.sort()));
    } else {
        if (sortByProperty === '') throw new AssertionError('Expected as sortByProperty when comparing objects.')
        return Expectation.thatActualShould<any[], any[]>(`contain all items in any order sorted by '${sortByProperty}' from`, expected)
            .soThat((actualValue, expectedValue) => equal(
                actualValue.sort((a, b) => (a[sortByProperty] > b[sortByProperty] ? -1 : 1)),
                expectedValue.sort((a, b) => (a[sortByProperty] > b[sortByProperty] ? -1 : 1))))
    }
}
