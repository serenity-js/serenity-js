import 'mocha';

import { expect } from '@integration/testing-tools';
import { ExecutionSuccessful } from '@serenity-js/core/lib/model';

import { MochaOutcomeMapper } from '../src/mappers';
import { OutcomeRecorder } from '../src/OutcomeRecorder';
import { exampleTest } from './exampleTest';

describe('OutcomeRecorder', () => {
    const mapper = new MochaOutcomeMapper();
    let recorder: OutcomeRecorder;

    beforeEach(() => {
        recorder = new OutcomeRecorder();
    });

    it('returns no outcome if no outcome was recorded', () => {
        expect(recorder.outcomeOf(exampleTest)).to.equal(undefined);
    });

    it('returns an outcome recorded for a given test', () => {
        recorder.started(exampleTest);
        recorder.finished(exampleTest, mapper.outcomeOf(exampleTest));

        expect(recorder.outcomeOf(exampleTest)).to.equal(new ExecutionSuccessful());
    });

    it('allows for a recorded outcome to be erased', () => {
        recorder.started(exampleTest);
        recorder.finished(exampleTest, mapper.outcomeOf(exampleTest));
        recorder.erase(exampleTest);

        expect(recorder.outcomeOf(exampleTest)).to.equal(undefined);
    });
});
