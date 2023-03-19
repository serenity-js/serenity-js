import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import { SceneFinished, SceneStarts, TestRunFinished, TestRunFinishes, TestRunStarts } from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { protractor } from '../src/protractor';

describe('@serenity-js/protractor with @serenity-js/cucumber', function () {

    this.timeout(30000);

    it('allows to run a scenario located on a specific line', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/features/multiple_scenarios.feature:7',
        )
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A passing scenario')))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
            ;

            expect(result.events.filter(event => event instanceof SceneStarts)).to.have.lengthOf(1);
        }));
});
