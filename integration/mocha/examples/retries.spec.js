describe('Mocha reporting', () => {

    describe('A scenario', () => {

        let retries = 0;

        it('passes the third time', () => {

            if (retries++ < 2) {
                throw new Error(`Something happened`);
            }

            // third time lucky, isn't it?

        });
    });
});
