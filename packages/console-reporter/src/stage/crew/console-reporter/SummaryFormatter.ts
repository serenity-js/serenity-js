import { ExecutionCompromised, ExecutionFailedWithAssertionError, ExecutionFailedWithError, ExecutionIgnored, ExecutionSkipped, ImplementationPending } from '@serenity-js/core/lib/model';

import type { AggregatedCategories, AggregatedCategory } from './Summary';
import type { TerminalTheme } from './themes';

/**
 * @package
 */
export class SummaryFormatter {
    constructor(private readonly theme: TerminalTheme) {
    }

    format(aggregatedCategories: AggregatedCategories): string {
        const
            categoryNames                   = this.sorted(Object.keys(aggregatedCategories.categories)),
            maxCategoryNameLength           = Math.max(...(categoryNames.map(categoryName => categoryName.length))),
            maxCategoryNameLengthAllowed    = Math.min(Math.max(maxCategoryNameLength, 10), 30);

        return [
            this.theme.heading('Execution Summary'),
            '',
            ...categoryNames.map(categoryName => {
                const displayName = (categoryName.length > maxCategoryNameLengthAllowed
                    ? categoryName.slice(0, maxCategoryNameLengthAllowed - 4) + `...:`
                    : `${ categoryName }:`).padEnd(maxCategoryNameLengthAllowed + 1);

                return `${ this.theme.heading(displayName) } ${ this.formatTotalsFor(aggregatedCategories.categories[categoryName]) }`;
            }),
            ``,
            `Total time: ${ this.theme.heading(aggregatedCategories.totalTime) }`,
            `Real time: ${ this.theme.heading(aggregatedCategories.realTime) }`,
            `Scenarios:  ${ this.theme.heading(aggregatedCategories.numberOfScenarios) }`,
            '',
        ].join('\n');
    }

    private sorted(strings: string[]) {
        return strings.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    }

    private formatTotalsFor(category: AggregatedCategory): string {
        const outcomes = Object.keys(category.outcomes)
            .filter(outcomeName => category.outcomes[outcomeName].count > 0)
            .sort((left, right) => category.outcomes[left].code > category.outcomes[right].code ? 1 : -1)
            .reduce((acc, outcomeName) => {
                acc.push(this.theme.outcome(outcomeName, `${category.outcomes[outcomeName].count} ${this.nameOf(outcomeName)}`));
                return acc;
            } , [])
            .join(', ');

        const total = Object.keys(category.outcomes).map(outcomeName => category.outcomes[outcomeName].count).reduce((acc, count) => acc + count, 0);

        return `${ outcomes }, ${ total } total (${ category.totalTime })`;
    }

    private nameOf(outcomeName: string) {
        switch (outcomeName) {
            case ExecutionCompromised.name:                 return 'compromised';
            case ExecutionFailedWithError.name:             return 'broken';
            case ExecutionFailedWithAssertionError.name:    return 'failed';
            case ImplementationPending.name:                return 'pending';
            case ExecutionSkipped.name:                     return 'skipped';
            case ExecutionIgnored.name:                     return 'ignored';
            // case ExecutionSuccessful.name:
            default:
                return 'successful';
        }
    }
}
