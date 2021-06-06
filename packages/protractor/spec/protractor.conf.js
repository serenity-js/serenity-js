exports.config = {
    ...require('../../../protractor.conf'),

    specs: [ '**/*.spec.ts' ],

    params: {
        env: 'test',
        user: {
            id: 1,
            firstName: 'Jan',
            lastName: 'Molak',
        }
    },
};
