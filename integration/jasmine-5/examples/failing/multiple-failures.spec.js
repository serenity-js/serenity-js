describe('Jasmine', () => {

    describe('A scenario', () => {

        it('can fail with multiple failures', () => {
            expect(true).toEqual(true);

            fail(`first issue`);
            fail(`second issue`);
            expect(false).toEqual(true);
        });
    });
});
