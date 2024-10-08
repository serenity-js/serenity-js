const { AssertionError } = require('assert');

describe('Jasmine', () => {

    describe('A scenario', () => {

        it('fails', () => {
            throw new AssertionError({
                actual: false,
                expected: true,
                operator: 'strictEqual',
            });
        });
    });
});
