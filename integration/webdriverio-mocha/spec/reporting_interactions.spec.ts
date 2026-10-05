import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, StdOutReporter } from '@integration/testing-tools';
import { InteractionFinished, InteractionStarts, SceneFinished, SceneStarts, TaskStarts } from '@serenity-js/core/events';
import { ExecutionSuccessful, Name } from '@serenity-js/core/model';
import { describe, it } from 'mocha';

import { wdio } from '../src';

describe('Serenity/JS with WebdriverIO and Mocha', function () {

    this.timeout(60_000);

    describe('when the config file uses type-only imports', () => {

        // https://github.com/serenity-js/serenity-js/issues/3535
        it('reports interactions as interactions, not tasks', () =>
            wdio(
                './examples/wdio.type-only-imports.conf.ts',
                '--spec=examples/interaction_scenario.spec.ts',
            )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                const events = StdOutReporter.parse(result.stdout);

                expect(events.filter(event => event instanceof TaskStarts)).to.have.lengthOf(0);

                PickEvent.from(events)
                    .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name('A scenario performs an interaction')))
                    .next(InteractionStarts,    event => expect(event.details.name).to.equal(new Name(`Alice logs: 'Hello'`)))
                    .next(InteractionFinished,  event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(SceneFinished,        event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                ;
            }));
    });
});
