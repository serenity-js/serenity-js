module.exports = {
    staging:   {
        all:                'staging',
        reports:   {
            all:            'staging/reports',
            coverage:   {
                all:        'staging/reports/coverage',
                spec:       'staging/reports/coverage/spec',
                behaviour:  'staging/reports/coverage/behaviour',
            }
        },
        traspiled: {
            all:        'staging/transpiled',
            src:        'staging/transpiled/src/**/*.js',
            spec:       'staging/transpiled/spec/**/*.js',
            behaviour:  'staging/transpiled/behaviour/**/*.js',
            export:     'staging/transpiled/src/**/*'
        }
    },
    export:     'lib',

    src:        'src/**/*.ts',
    spec:       'spec/**/*.ts',
    behaviour:   {
        spec:       'behaviour/**/*.ts',
        examples:   [ 'behaviour/**/cucumber/features/**/*', 'behaviour/**/cucumber/**/*.js' ]
    },

    typings:    'typings/index.d.ts'
};