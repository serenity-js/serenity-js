describe('Mocha reporting', () => {

    describe('A scenario', () => {

        it('fails when a non-error is passed to done()', done => {
            done(`Something happened`);
        });
    });
});
