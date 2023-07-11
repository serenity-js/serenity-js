import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

import { Selector } from '../../../../src';

describe('Selector', () => {

    it('produces a human-friendly description of a custom selector that extends it', () => {
        const selector = new ByReactComponentName('header');
        expect(selector.toString()).to.equal(`by react component name ('header')`)
    });

    it('produces a human-friendly description of a custom selector with multiple values', () => {
        const selector = new ByReactComponentNameContainingText('header', 'expected text');
        expect(selector.toString()).to.equal(`by react component name containing text ('header', 'expected text')`)
    });

    it('is comparable', () => {
        const first = new ByReactComponentNameContainingText('header', 'expected text');
        const second = new ByReactComponentNameContainingText('header', 'expected text');
        expect(first).to.equal(second);
    });

    it('is serialisable to JSON', () => {
        const selector = new ByReactComponentNameContainingText('header', 'expected text');

        expect(selector.toJSON()).to.deep.equal({
            value: 'header',
            text: 'expected text'
        });
    });

    describe('when read', () => {

        it('provides access to selector value', async () => {
            const value: string = new ByReactComponentName('header').value;
            expect(value).to.equal('header');
        });
    });
});

class ByReactComponentName extends Selector {
    constructor(public readonly value: string) {
        super();
    }
}

class ByReactComponentNameContainingText extends Selector {
    constructor(public readonly value: string, public readonly text: string) {
        super();
    }
}
