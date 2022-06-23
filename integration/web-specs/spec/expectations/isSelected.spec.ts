import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, AssertionError, Wait } from '@serenity-js/core';
import { By, isSelected, Navigate, PageElement } from '@serenity-js/web';

describe('isSelected', function () {

    const Languages = {
        typeScript: PageElement.located(By.css('select[name="languages"] > option[value="TypeScript"]')).describedAs('the TypeScript option'),
        javaScript: PageElement.located(By.css('select[name="languages"] > option[value="JavaScript"]')).describedAs('the JavaScript option'),
        java:       PageElement.located(By.css('select[name="languages"] > option[value="Java"]')).describedAs('the Java option'),
    };

    beforeEach(() =>
        actorCalled('Wendy').attemptsTo(
            Navigate.to('/expectations/is-selected/programming_languages.html'),
        ));

    /** @test {isSelected} */
    it('allows the actor flow to continue when the element is selected', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Wait.until(Languages.typeScript, isSelected()),
            Ensure.that(Languages.typeScript, isSelected()),
        )).to.be.fulfilled);

    /** @test {isSelected} */
    it('breaks the actor flow when element is not selected', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Ensure.that(Languages.javaScript, isSelected()),
        )).to.be.rejectedWith(AssertionError, `Expected the JavaScript option to become selected`));

    /** @test {isSelected} */
    it('breaks the actor flow when element is not present', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Ensure.that(Languages.java, isSelected()),
        )).to.be.rejectedWith(AssertionError, `Expected the Java option to become selected`));

    /** @test {isSelected} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Languages.typeScript, isSelected()).toString())
            .to.equal(`#actor ensures that the TypeScript option does become selected`);
    });

    /** @test {isSelected} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Languages.typeScript, isSelected()).toString())
            .to.equal(`#actor waits up to 5s, polling every 500ms, until the TypeScript option does become selected`);
    });
});
