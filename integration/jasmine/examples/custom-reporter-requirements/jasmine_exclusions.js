describe('excluded suite', function () {
    it('will be excluded', function () {
        expect(1).toBe(2);
    });
});

fdescribe('focused suite, excludes other suites and specs', function () {
    xdescribe('pending suite', function () {
        it('will be pending', function () {
            expect(2).toBe(1);
        });
    });

    xit('pending spec', function () {
        expect(2).toBe(4);
    });

    it('spec', function () {
        expect(1).toBe(1);
    });
});
