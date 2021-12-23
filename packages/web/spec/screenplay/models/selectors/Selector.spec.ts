import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

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

    describe('when read', () => {

        it('provides access to selector parameters', async () => {
            const parameters: [string] = new ByReactComponentName('header').parameters;
            expect(parameters).to.deep.equal([ 'header' ]);
        });

        it('resolves to a tuple containing all the values of the selector', async () => {
            const parameters: [string, string] = new ByReactComponentNameContainingText('header', 'expected text').parameters;
            expect(parameters).to.deep.equal([ 'header', 'expected text' ]);
        });
    });
});

class ByReactComponentName extends Selector<[string]> {
}

class ByReactComponentNameContainingText extends Selector<[string, string]> {
}
