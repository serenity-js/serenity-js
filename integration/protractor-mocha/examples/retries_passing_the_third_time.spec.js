describe('Mocha', () => {

    describe('A scenario', () => {

        let retries = 0;

        it('passes the third time', () => {

            if (retries++ < 2) {
                throw new Error(`Something's happened`);
            }

            // third time lucky, isn't it?

        });
    });
});
