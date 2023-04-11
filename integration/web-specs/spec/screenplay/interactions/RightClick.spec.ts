import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Duration, Wait } from '@serenity-js/core';
import { Attribute, By, Navigate, PageElement, RightClick, Text } from '@serenity-js/web';

describe('RightClick', () => {

    const MouseEventLoggerForm = {
        input:  PageElement.located(By.id('input')).describedAs('input'),
        output: PageElement.located(By.id('output')).describedAs('output'),
    }

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const json = (text: string): object =>
        JSON.parse(text);

    it('allows the actor to right-click on an element', () => actorCalled('Bernie').attemptsTo(
        Navigate.to('/screenplay/interactions/right-click/mouse_event_logger.html'),

        Ensure.eventually(Attribute.called('data-event-handled').of(MouseEventLoggerForm.input), equals('false')),
        Wait.for(Duration.ofSeconds(1)),
        RightClick.on(MouseEventLoggerForm.input),
        Wait.for(Duration.ofSeconds(1)),

        Wait.until(Attribute.called('data-event-handled').of(MouseEventLoggerForm.input), equals('true')),

        Ensure.that(Text.of(MouseEventLoggerForm.output).as(json), equals({
            button: 2,
        })),
    ));

    it('provides a sensible description of the interaction being performed', () => {
        expect(RightClick.on(MouseEventLoggerForm.input).toString())
            .to.equal('#actor right-clicks on input');
    });

    it('correctly detects its invocation location', () => {
        const activity = RightClick.on(MouseEventLoggerForm.input);
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('RightClick.spec.ts');
        expect(location.line).to.equal(40);
        expect(location.column).to.equal(37);
    });
});
