import { stage } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { Alert } from '../../../src/screenplay/questions';
import { alertTargets, pageFromTemplate, pageWithAlerts } from '../../fixtures';
import { UIActors } from '../../UIActors';
import { Click, Navigate } from '../../../src/screenplay/interactions';

describe('Alert', () => {

    const Nick = stage(new UIActors()).actor('Nick');

    /** @test {Attribute} */
    it('allows the actor to determine that alert visibility is false', () => Nick.attemptsTo(
        Navigate.to(pageFromTemplate(`
        <html lang="en" />
    `)),
        Ensure.that(Alert.visibility(), equals(false)),
    ));

    it('allows the actor to determine that alert visibility is false', () => Nick.attemptsTo(
        Navigate.to(pageFromTemplate(pageWithAlerts)),
        Click.on(alertTargets.trigger),
        Ensure.that(Alert.visibility(), equals(true)),
    ));


});
