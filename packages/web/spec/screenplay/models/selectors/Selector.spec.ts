import { expect } from '@integration/testing-tools';
import { actorCalled, Answerable, Question } from '@serenity-js/core';
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { Selector } from '../../../../src';

/** @test {Selector} */
describe('Selector', () => {

    it('produces a human-friendly description of a custom selector that extends it', () => {
        const selector = new ByReactComponentName('header');
        expect(selector.toString()).to.equal(`by react component name ('header')`)
    });

    it('produces a human-friendly description of a custom selector with multiple values', () => {
        const selector = new ByReactComponentNameContainingText('header', 'expected text');
        expect(selector.toString()).to.equal(`by react component name containing text ('header', 'expected text')`)
    });

    it('can have its description overridden', () => {
        const selector = new ByReactComponentName('header').describedAs('header component');
        expect(selector.toString()).to.equal(`header component`)
    });

    given([
        { description: 'string',                    expected: `by react component name ('header')`,         value: 'header' },
        { description: 'Promise<string>',           expected: `by react component name (<<Promise>>)`,      value: Promise.resolve('header') },
        { description: 'Question<string>',          expected: `by react component name (<<my component>>)`, value: Question.about('my component', _actor => 'header') },
        { description: 'Question<Promise<string>>', expected: `by react component name (<<my component>>)`, value: Question.about('my component', _actor => Promise.resolve('header')) },
    ]).
    it('supports providing selector values as answerables', ({ value, expected }) => {
        const selector = new ByReactComponentName(value);
        expect(selector.toString()).to.equal(expected)
    });

    describe('when answered', () => {

        const actor = actorCalled('Selina');

        it('resolves to a tuple containing the value of the selector', async () => {
            const answer: [string] = await actor.answer(new ByReactComponentName('header'));
            expect(answer).to.deep.equal([ 'header' ]);
        });

        it('resolves to a tuple containing all the values of the selector', async () => {
            const answer: [string, string] = await actor.answer(new ByReactComponentNameContainingText('header', 'expected text'));
            expect(answer).to.deep.equal([ 'header', 'expected text' ]);
        });
    });
});

class ByReactComponentName extends Selector<[string]> {
    constructor(componentName: Answerable<string>) {
        super([componentName]);
    }
}

class ByReactComponentNameContainingText extends Selector<[string, string]> {
    constructor(componentName: Answerable<string>, text: Answerable<string>) {
        super([componentName, text]);
    }
}
