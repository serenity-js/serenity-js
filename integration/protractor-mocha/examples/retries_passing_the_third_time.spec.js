describe('Mocha', () => {

    describe('A scenario', () => {

        let counter = 0;

        it('passes the third time', () => {

            if (counter++ < 3) {
                throw new Error(`Something's happened`);
            }

            // third time lucky, isn't it?

        });
    });
});
