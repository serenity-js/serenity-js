import { expect, ifExitCodeIsOtherThan, logOutput } from '@integration/testing-tools';
import {
    DomainEvent,
    SceneFinished,
    SceneStarts,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts
} from '@serenity-js/core/lib/events';
import { describe, it } from 'mocha';

import { playwrightTest } from '../../src/playwright-test';

describe('Compatibility', function () {

    it('emits the same events for both native Playwright and Serenity/JS test APIs', async () => {

        const native = await playwrightTest(
            '--project=default',
            'events/compatibility/passing-native-api.spec.ts',
        ).then(ifExitCodeIsOtherThan(0, logOutput));

        const serenity = await playwrightTest(
            '--project=default',
            'events/compatibility/passing-serenity-api.spec.ts',
        ).then(ifExitCodeIsOtherThan(0, logOutput));

        expect(native.exitCode).to.equal(0);
        expect(serenity.exitCode).to.equal(0);

        const sceneEventTypes = types(
            TestRunStarts,
            SceneStarts,
            TestRunnerDetected,
            SceneFinished,
            TestRunFinishes,
            TestRunFinished,
        );

        const nativeEvents = native.events.filter(sceneEventTypes).map(event => event.constructor.name)
        const serenityEvents = serenity.events.filter(sceneEventTypes).map(event => event.constructor.name);

        expect(serenityEvents).to.deep.equal(nativeEvents)
    });
});

function types<T extends DomainEvent>(... types: Array<{ new (... args: any[]): T }>): (value: T, index: number, array: T[]) => boolean {
    return (value: T, index: number, array: T[]): boolean => {
        for (const type of types) {
            if (value instanceof type) {
                return true;
            }
        }
        return false;
    }
}
