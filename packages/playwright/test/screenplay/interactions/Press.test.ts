import { Actor, actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import chaiExclude from 'chai-exclude';
import { ElementHandle, Page } from 'playwright';
import { createSandbox, SinonStub } from 'sinon';

import { BrowseTheWeb } from '../../../src/screenplay';
import {
    Key,
    NormalizedKey,
    Press,
} from '../../../src/screenplay/interactions';
import { Target } from '../../../src/screenplay/questions/targets';
import { chai } from '../../chai-extra';
import {
    browserTypeStub,
    elementHandleStub,
    pageStub,
} from '../../stubs/playwright';

chai.use(chaiExclude);
chai.should();

const { expect } = chai;

const { $ } = Target;

describe("'Click' interaction", () => {
    const sandbox = createSandbox();
    let browseTheWeb: BrowseTheWeb;
    let actor: Actor;
    let page: Page;
    let element: ElementHandle;

    beforeEach(() => {
        browseTheWeb = BrowseTheWeb.using(browserTypeStub(sandbox));
        actor = actorCalled('Actor').whoCan(browseTheWeb);
        page = pageStub(sandbox);
        browseTheWeb.waitForTimeout = sandbox.stub();
        (browseTheWeb as any).page = sandbox.stub().resolves(page);
        element = elementHandleStub(sandbox);
        page.$ = sandbox.stub().resolves(element);
    });

    afterEach(() => {
        sandbox.restore();
        serenity.announce(new TestRunFinishes());
    });

    it.each([
        {
            passedKeys: ['A', 'B', 'C', 'D', 'E', 'F'],
            pressedKeys: ['A', 'B', 'C', 'D', 'E', 'F'],
        },
        {
            passedKeys: [
                {
                    key: 't',
                    modifiers: ['Shift', 'Control'],
                } as NormalizedKey,
            ],
            pressedKeys: ['Shift+Control+t'],
        },
        {
            passedKeys: [
                {
                    key: 't',
                    modifiers: ['Shift', 'Control'],
                } as NormalizedKey,
            ],
            pressedKeys: ['Shift+Control+t'],
        },
        {
            passedKeys: [
                'H',
                'i',
                '!',
                {
                    key: 'a',
                    modifiers: ['Meta'],
                } as NormalizedKey,
                'Backspace',
            ],
            pressedKeys: ['H', 'i', '!', 'Meta+a', 'Backspace'],
        },
    ])(
        'presses the right keys',
        async ({
            passedKeys,
            pressedKeys,
        }: {
            passedKeys: Key[];
            pressedKeys: string[];
        }) => {
            await Press.the(...passedKeys)
        .in($('element'))
        .performAs(actor);
            element.press.should.have.callCount(passedKeys.length);
            pressedKeys.forEach((key, index) => {
                expect((element.press as SinonStub).getCall(index).args[0]).to.be.equal(
                    key
                );
            });
        }
    );
});
