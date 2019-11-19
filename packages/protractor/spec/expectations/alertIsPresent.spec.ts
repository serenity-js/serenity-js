import { expect, stage } from '@integration/testing-tools';
import { Ensure, equals} from '@serenity-js/assertions';
import { Alert, Accept, Click, Dismiss, Navigate, Text, Wait } from '../../src';
import { alertTargets, pageFromTemplate, pageWithAlerts } from '../fixtures';
import { UIActors } from '../UIActors';

describe('When demonstrating how to work with alert windows, an actor', function () {

    const Nick = stage(new UIActors()).actor('Nick');

    beforeEach(() => Nick.attemptsTo(
        Navigate.to(pageFromTemplate(pageWithAlerts)),
    ));

    /** @test {Accept alert} */
    it('can click the OK action of a triggered alert and see the alert accepted', () => expect(Nick.attemptsTo(
        Click.on(alertTargets.trigger),
        Wait.until(Alert.visibility(), equals(true)),
        Accept.alert(),
        Ensure.that(Text.of(alertTargets.textResult), equals('You pressed OK!')),
    )).to.be.fulfilled);

    /** @test {Dismiss alert} */
    it('can click the cancel action of a triggered alert and see the alert dismissed', () => expect(Nick.attemptsTo(
        Click.on(alertTargets.trigger),
        Wait.until(Alert.visibility(), equals(true)),
        Dismiss.alert(),
        Ensure.that(Text.of(alertTargets.textResult), equals('You pressed OK!')),
    )).to.be.fulfilled);

});
