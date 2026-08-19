describe('Jasmine', () => {

    describe('Worker B', () => {

        it('passes test B1', () => {
            expect(true).toBe(true);
        });

        it('fails test B2', () => {
            expect(false).toBe(true);
        });
    });
});
