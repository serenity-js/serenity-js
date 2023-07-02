import { Duration, Timestamp } from '@serenity-js/core';
import type {
    Outcome,
    ScenarioDetails} from '@serenity-js/core/lib/model';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending
} from '@serenity-js/core/lib/model';

/**
 * @package
 */
export class Summary {
    private readonly records: SummaryRecord[] = [];

    private testRunStartedAt: Timestamp = new Timestamp();
    private testRunFinishedAt: Timestamp = new Timestamp();

    record(details: ScenarioDetails, outcome: Outcome, duration: Duration): void {
        this.records.push({ details, outcome, duration });
    }

    aggregated(): AggregatedCategories {
        return this.records.reduce((acc: AggregatedCategories, record) => {
            acc.totalTime = acc.totalTime.plus(record.duration);

            const categoryName = record.details.category.value;

            if (! acc.categories[categoryName]) {
                acc.categories[categoryName] = {
                    name: categoryName,
                    outcomes: {
                        [ExecutionCompromised.name]:                { count: 0, code: ExecutionCompromised.Code                 },
                        [ExecutionFailedWithError.name]:            { count: 0, code: ExecutionFailedWithError.Code             },
                        [ExecutionFailedWithAssertionError.name]:   { count: 0, code: ExecutionFailedWithAssertionError.Code    },
                        [ImplementationPending.name]:               { count: 0, code: ImplementationPending.Code                },
                        [ExecutionSkipped.name]:                    { count: 0, code: ExecutionSkipped.Code                     },
                        [ExecutionIgnored.name]:                    { count: 0, code: ExecutionIgnored.Code                     },
                        [ExecutionSuccessful.name]:                 { count: 0, code: ExecutionSuccessful.Code                  },
                    },
                    totalTime: Duration.ofMilliseconds(0),
                };
            }

            acc.categories[categoryName].outcomes[record.outcome.constructor.name].count ++;

            acc.categories[categoryName].totalTime = acc.categories[categoryName].totalTime.plus(record.duration);

            return acc;
        }, {
            categories: {},
            totalTime: Duration.ofMilliseconds(0),
            realTime: this.testRunFinishedAt.diff(this.testRunStartedAt),
            numberOfScenarios: this.records.length
        });
    }

    recordTestRunStartedAt(timestamp: Timestamp): void {
        this.testRunStartedAt = timestamp;
    }

    recordTestRunFinishedAt(timestamp: Timestamp): void {
        this.testRunFinishedAt = timestamp;
    }
}

/**
 * @package
 */
export interface AggregatedCategories {
    categories: {[categoryName: string]: AggregatedCategory};
    totalTime: Duration;
    realTime: Duration;
    numberOfScenarios: number;
}

/**
 * @package
 */
export interface AggregatedCategory {
    name: string;
    outcomes: {[outcomeType: string]: { count: number, code: number }};
    totalTime: Duration;
}

interface SummaryRecord {
    details: ScenarioDetails;
    outcome: Outcome;
    duration: Duration;
}
