import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { DomainEvent, SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import {
    ArbitraryTag,
    CapabilityTag,
    ExecutionSuccessful,
    FeatureTag,
    Name,
    ProjectTag
} from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../../src/playwright-test';

describe('Repeated', () => {

    describe('Test scenario', () => {

        it('is not reported as repeated upon its first execution', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/repeated.spec.ts',
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario passes')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Playwright')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Outcomes')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Repeated')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new ProjectTag('default')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))

            expect(arbitraryTagsFrom(result.events)).to.deep.equal([]);
        });

        it('includes the repetition index in its name when repeated', async () => {
            const result = await playwrightTest(
                '--project=default',
                'outcomes/repeated.spec.ts',
                '--workers=1',
                '--repeat-each=3'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario passes')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario passes - Repetition 1')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('Test scenario passes - Repetition 2')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))

            expect(arbitraryTagsFrom(result.events)).to.deep.equal([ ]);
        });
    });
});

function arbitraryTagsFrom(events: DomainEvent[]): string[] {
    return events
        .filter((e: SceneTagged) =>
            e instanceof SceneTagged &&
            e.tag instanceof ArbitraryTag
        )
        .map((e: SceneTagged) => e.tag.name)
}
