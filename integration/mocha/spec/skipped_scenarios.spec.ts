import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionSkipped, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { mocha } from '../src/mocha';

describe('@serenity-js/mocha', function () {

    this.timeout(10000);

    describe('recognises a skipped scenario that', () => {

        it('is marked as skipped (this.skip())', () => mocha('examples/skipped/marked-as-skipped-this-skip.spec.js')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name(`A scenario is marked as skipped programmatically`)))
                    .next(TestRunnerDetected,   event => expect(event.name).to.equal(new Name('Mocha')))
                    .next(SceneFinished,        event => expect(event.outcome).to.be.instanceof(ExecutionSkipped))
                ;
            }));
    });
});
