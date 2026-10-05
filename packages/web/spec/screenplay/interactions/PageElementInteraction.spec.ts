import { expect } from '@integration/testing-tools';
import {
    Actor,
    Clock,
    Duration,
    ListItemNotFoundError,
    LogicError,
    Question,
    ScheduleWork,
    Stage
} from '@serenity-js/core';
import { beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';

import { Click, type PageElement } from '../../../src/index.js';

describe('PageElementInteraction', () => {

    const interactionTimeout = Duration.ofMilliseconds(250);

    let actor: Actor,
        element: { scrollIntoView: sinon.SinonStub, click: sinon.SinonStub };

    beforeEach(() => {
        const stage = sinon.createStubInstance(Stage);

        actor = new Actor('Alice', stage as unknown as Stage, [
            new ScheduleWork(new Clock(), interactionTimeout),
        ]);

        element = {
            scrollIntoView: sinon.stub().resolves(),
            click:          sinon.stub().resolves(),
        };
    });

    /**
     * Mimics a filtered list of page elements, such as `PageElements.located(…).where(…).first()`,
     * which throws a ListItemNotFoundError until the list gets populated.
     */
    function listItemAvailableAfter(failedAttempts: number) {
        const attempts = { count: 0 };

        const question = Question.about<PageElement>('first matching item', async _actor => {
            attempts.count++;

            if (attempts.count <= failedAttempts) {
                throw new ListItemNotFoundError(`Can't retrieve the first item from a list with 0 items: [ ]`);
            }

            return element as unknown as PageElement;
        });

        return { question, attempts };
    }

    describe('when the target element is resolved from a list', () => {

        it('interacts with the element straight away when the list item is available', async () => {
            const { question, attempts } = listItemAvailableAfter(0);

            await Click.on(question).performAs(actor);

            expect(attempts.count).to.equal(1);
            expect(element.click).to.have.been.calledOnce;
        });

        it('waits for the list item to become available', async () => {
            const { question, attempts } = listItemAvailableAfter(3);

            await Click.on(question).performAs(actor);

            expect(attempts.count).to.equal(4);
            expect(element.click).to.have.been.calledOnce;
        });

        it('complains if the list item does not become available within the interaction timeout', async () => {
            const { question } = listItemAvailableAfter(Number.POSITIVE_INFINITY);

            await expect(Click.on(question).performAs(actor)).to.be.rejectedWith(
                ListItemNotFoundError,
                `Can't retrieve the first item from a list with 0 items: [ ]`,
            );

            expect(element.click).to.not.have.been.called;
        });
    });

    it('does not retry errors other than ListItemNotFoundError', async () => {
        let attempts = 0;

        const question = Question.about<PageElement>('broken element', async _actor => {
            attempts++;
            throw new LogicError('Something went wrong');
        });

        await expect(Click.on(question).performAs(actor)).to.be.rejectedWith(LogicError, 'Something went wrong');

        expect(attempts).to.equal(1);
    });
});
