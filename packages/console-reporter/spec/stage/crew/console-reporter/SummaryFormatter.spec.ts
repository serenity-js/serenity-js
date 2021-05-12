import 'mocha';

import { expect } from '@integration/testing-tools';
import { Duration } from '@serenity-js/core';
import { FileSystemLocation, Path, trimmed } from '@serenity-js/core/lib/io';
import { Category, ExecutionFailedWithError, ExecutionSuccessful, Name, ScenarioDetails } from '@serenity-js/core/lib/model';

import { Summary } from '../../../../src/stage/crew/console-reporter/Summary';
import { SummaryFormatter } from '../../../../src/stage/crew/console-reporter/SummaryFormatter';
import { ThemeForMonochromaticTerminals } from '../../../../src/stage/crew/console-reporter/themes';

describe('SummaryFormatter', () => {
    const
        defaultCardPayment = new ScenarioDetails(
            new Name('Default card payment'),
            new Category('Checkout'),
            new FileSystemLocation(Path.fromJSON('features/checkout.feature')),
        ),
        addingProductToBasket = new ScenarioDetails(
            new Name('Adding product to a basket'),
            new Category('Basket'),
            new FileSystemLocation(Path.fromJSON('features/basket.feature')),
        ),
        removingProductToBasket = new ScenarioDetails(
            new Name('Removing product from a basket'),
            new Category('Basket'),
            new FileSystemLocation(Path.fromJSON('features/basket.feature')),
        ),
        longCategoryName = new ScenarioDetails(
            new Name('Recording customer details'),
            new Category('Know-Your-Customer and Anti Money Laundering requirements'),
            new FileSystemLocation(Path.fromJSON('features/registration.feature')),
        );

    let summary: Summary,
        formatter: SummaryFormatter;

    beforeEach(() => {
        summary = new Summary();
        formatter = new SummaryFormatter(new ThemeForMonochromaticTerminals());
    });

    it('provides an empty description if no tests are recorded', () => {

        expect(formatter.format(summary.aggregated())).to.equal(trimmed `
            | Execution Summary
            |
            |
            | Total time: 0ms
            | Scenarios:  0
        `);
    });

    it('provides summary of a single successful category', () => {

        summary.record(defaultCardPayment, new ExecutionSuccessful(), Duration.ofMilliseconds(5));

        expect(formatter.format(summary.aggregated())).to.equal(trimmed `
            | Execution Summary
            |
            | Checkout:   1 successful, 1 total (5ms)
            |
            | Total time: 5ms
            | Scenarios:  1
        `);
    });

    it('aggregates results per category', () => {
        summary.record(defaultCardPayment, new ExecutionSuccessful(), Duration.ofMilliseconds(5));
        summary.record(addingProductToBasket, new ExecutionSuccessful(), Duration.ofMilliseconds(10));
        summary.record(removingProductToBasket, new ExecutionFailedWithError(new Error('boom')), Duration.ofMilliseconds(100));

        expect(formatter.format(summary.aggregated())).to.equal(trimmed `
            | Execution Summary
            |
            | Basket:     1 broken, 1 successful, 2 total (110ms)
            | Checkout:   1 successful, 1 total (5ms)
            |
            | Total time: 115ms
            | Scenarios:  3
        `);
    });

    it('caps the category name at 30 characters', () => {
        summary.record(longCategoryName, new ExecutionSuccessful(), Duration.ofMilliseconds(5));

        expect(formatter.format(summary.aggregated())).to.equal(trimmed `
            | Execution Summary
            |
            | Know-Your-Customer and Ant...:  1 successful, 1 total (5ms)
            |
            | Total time: 5ms
            | Scenarios:  1
        `);
    });

    it('keeps the padding consistent between longer and shorter category names', () => {
        summary.record(addingProductToBasket, new ExecutionSuccessful(), Duration.ofMilliseconds(10));
        summary.record(longCategoryName, new ExecutionSuccessful(), Duration.ofMilliseconds(5));

        expect(formatter.format(summary.aggregated())).to.equal(trimmed `
            | Execution Summary
            |
            | Basket:                         1 successful, 1 total (10ms)
            | Know-Your-Customer and Ant...:  1 successful, 1 total (5ms)
            |
            | Total time: 15ms
            | Scenarios:  2
        `);
    });
});
