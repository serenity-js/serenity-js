describe('Mocha reporting', () => {

    describe('A scenario', () => {

        it('fails when an error is passed to done()', done => {
            done(new Error(`Something happened`));
        });
    });
});
