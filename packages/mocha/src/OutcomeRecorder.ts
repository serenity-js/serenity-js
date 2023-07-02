import type { Outcome } from '@serenity-js/core/lib/model';
import type { Test } from 'mocha';

/**
 * @package
 */
export class OutcomeRecorder {
    private recordedOutcomes: RecordedOutcome[] = [];

    public started(test: Test): void {
        this.recordedOutcomes.push({ test });
    }

    public finished(test: Test, outcome: Outcome): void {
        this.recordedOutcomes = this.recordedOutcomes.map(recordedOutcome =>
            recordedOutcome.test === test
                ? {...recordedOutcome, outcome }
                : recordedOutcome
        )
    }

    public outcomeOf(test: Test): Outcome {
        return this.recordedOutcomes.find(recordedOutcome => recordedOutcome.test === test)?.outcome;
    }

    public erase(test: Test): void {
        this.recordedOutcomes = this.recordedOutcomes.filter(recordedOutcome => recordedOutcome.test !== test);
    }
}

interface RecordedOutcome {
    test: Test;
    outcome?: Outcome;
}
