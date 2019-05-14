describe('Jasmine', () => {

    describe('A scenario', () => {

        it('fails when an error is thrown', () => {
            throw new Error(`Something happened`); // fail with throw
        });
    });
});
