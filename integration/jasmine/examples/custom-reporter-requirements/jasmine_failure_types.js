beforeAll(function () {
    fail('beforeAll')
});

afterAll(function () {
    fail('afterAll');
});

describe('a suite', function () {
    beforeAll(function () {
        fail('suite beforeAll');
    });

    afterAll(function () {
        fail('suite afterAll');
    });

    it('a spec', function () {
        fail('spec');
    });
});
