import 'mocha';

import { expect } from '@integration/testing-tools';

import { OutputStreamBuffer } from '../../../src/adapter/reporter';

describe('OutputStreamBuffer', () => {

    let buffer: OutputStreamBuffer;

    beforeEach(() => {
        buffer  = new OutputStreamBuffer('[prefix]');
    });

    it(`prefixes a line of content written to it`, () => {
        buffer.write('Hello');
        buffer.write(' ');
        buffer.write('World');

        expect(buffer.flush()).to.equal('[prefix] Hello World\n');
    });

    it(`prefixes multi-line content`, () => {
        buffer.write('first\nsecond\nthird');

        expect(buffer.flush()).to.equal(`[prefix] first\n[prefix] second\n[prefix] third\n`);
    });

    it(`clears the buffer when flushed`, () => {
        buffer.write('Hello World!');
        expect(buffer.flush()).to.equal('[prefix] Hello World!\n');
        expect(buffer.flush()).to.equal('[prefix] \n');
    });

    it(`knows when content has been written to it`, () => {
        expect(buffer.hasContent()).to.equal(false);

        buffer.write('');
        expect(buffer.hasContent()).to.equal(false);

        buffer.write('hello!');
        expect(buffer.hasContent()).to.equal(true);
    });
});
