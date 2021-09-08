import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, AssertionError, engage } from '@serenity-js/core';
import { by, isSelected, Navigate, Target, Wait } from '@serenity-js/web';

import { pageFromTemplate } from '../fixtures';
import { UIActors } from '../UIActors';

describe('isSelected', function () {

    const Languages = {
        TypeScript: Target.the('TypeScript option').located(by.css('select[name="languages"] > option[value="TypeScript"]')),
        JavaScript: Target.the('JavaScript option').located(by.css('select[name="languages"] > option[value="JavaScript"]')),
        Java:       Target.the('Java option').located(by.css('select[name="languages"] > option[value="Java"]')),
    };

    beforeEach(() => engage(new UIActors()));

    beforeEach(() => actorCalled('Bernie').attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html>
                <body>
                    <select name="languages">
                        <option selected value="TypeScript">TypeScript</option>
                        <option value="JavaScript">JavaScript</option>
                    </select>
                </body>
            </html>
        `)),
    ));

    /** @test {isSelected} */
    it('allows the actor flow to continue when the element is selected', () => expect(actorCalled('Bernie').attemptsTo(
        Wait.until(Languages.TypeScript, isSelected()),
        Ensure.that(Languages.TypeScript, isSelected()),
    )).to.be.fulfilled);

    /** @test {isSelected} */
    it('breaks the actor flow when element is not selected', () => {
        return expect(actorCalled('Bernie').attemptsTo(
            Ensure.that(Languages.JavaScript, isSelected()),
        )).to.be.rejectedWith(AssertionError, `Expected the JavaScript option to become selected`);
    });

    /** @test {isSelected} */
    it('breaks the actor flow when element is not present', () => {
        return expect(actorCalled('Bernie').attemptsTo(
            Ensure.that(Languages.Java, isSelected()),
        )).to.be.rejectedWith(AssertionError, `Expected the Java option to become present`);
    });

    /** @test {isSelected} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Languages.TypeScript, isSelected()).toString())
            .to.equal(`#actor ensures that the TypeScript option does become selected`);
    });

    /** @test {isSelected} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Languages.TypeScript, isSelected()).toString())
            .to.equal(`#actor waits up to 5s until the TypeScript option does become selected`);
    });
});
