describe('Mocha reporting', () => {

    describe('A scenario', () => {

        it(`is marked as skipped programmatically`, function () {
            this.skip();
        });
    });
});
