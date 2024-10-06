const port = process.env.PORT || 8081;

exports.config = {
    ...require('../../../protractor.conf'),

    baseUrl: `http://localhost:${ port }`,

    specs: [
        '**/*.spec.ts',
    ],

    params: {
        env: 'test',
        user: {
            id: 1,
            firstName: 'Jan',
            lastName: 'Molak',
        }
    },

    mochaOpts: {
        timeout: 60_000,
        reporter: 'mocha-multi',
        reporterOptions: {
            dot: '-',
            json: 'target/results.json',
        },
    },
};
