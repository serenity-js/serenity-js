import fs from 'node:fs';
import path from 'node:path';

import { expect, ifExitCodeIsOtherThan, logOutput } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import type { EventReceipt } from '../../src/LiveEventsRecorder';
import { playwrightTest } from '../../src/playwright-test';

describe('Live events', function () {

    const receiptsPath = path.resolve(__dirname, '../../target/live-events/receipts.json');

    it('announces domain events to reporter-side crew members while the scenario is still running, each event exactly once', async () => {

        fs.rmSync(receiptsPath, { force: true });

        const result = await playwrightTest(
            `--config=${ path.resolve(__dirname, '../../playwright-live-events.config.ts') }`,
            '--project=default',
            'live-events/long-running-scenario.spec.ts',
        ).then(ifExitCodeIsOtherThan(0, logOutput));

        expect(result.exitCode).to.equal(0);

        const receipts: EventReceipt[] = JSON.parse(fs.readFileSync(receiptsPath, 'utf8'));

        const duplicates = receipts
            .map(receipt => `${ receipt.type }:${ receipt.details }`)
            .filter((event, index, all) => all.indexOf(event) !== index);

        expect(duplicates, `each event should be announced exactly once`).to.be.empty;

        const indexOfSceneStarts = receipts.findIndex(receipt => receipt.type === 'SceneStarts');
        const firstInteraction = receipts.find(receipt => receipt.type === 'InteractionFinished' && receipt.details.includes('first interaction'));
        const secondInteraction = receipts.find(receipt => receipt.type === 'InteractionFinished' && receipt.details.includes('second interaction'));

        expect(indexOfSceneStarts, 'SceneStarts should be announced').to.be.greaterThan(-1);
        expect(firstInteraction, 'first InteractionFinished should be announced').to.not.be.undefined;
        expect(secondInteraction, 'second InteractionFinished should be announced').to.not.be.undefined;

        expect(
            receipts.indexOf(firstInteraction),
            'SceneStarts should be announced before the first InteractionFinished',
        ).to.be.greaterThan(indexOfSceneStarts);

        expect(
            secondInteraction.receivedAt - firstInteraction.receivedAt,
            'interactions separated by a 2s pause should be received as they happen, not in an end-of-test burst',
        ).to.be.greaterThan(1_000);
    });
});
