const port = process.env.PORT || 8081;

exports.config = {
    ...require('../../../protractor.conf'),

    baseUrl: `http://localhost:${ port }`,

    specs: [
        '**/*.spec.ts'
        // '**/Click.spec.ts',
        // '**/Clear.spec.ts',
        // '**/DoubleClick.spec.ts',
        // '**/Enter.spec.ts',
        // '**/Hover.spec.ts',
        // '**/Navigate.spec.ts',
        // '**/Press.spec.ts',
        // '**/RightClick.spec.ts',
        // '**/Wait.spec.ts',
    ],

    params: {
        env: 'test',
        user: {
            id: 1,
            firstName: 'Jan',
            lastName: 'Molak',
        }
    },
};
