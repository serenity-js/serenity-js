module.exports = {
    staging:   {
        all:                'staging',
        reports:   {
            all:            'staging/reports',
            coverage:   {
                all:        'staging/reports/coverage',
                spec:       'staging/reports/coverage/spec',
                cookbook:   'staging/reports/coverage/cookbook/coverage-final.json',
                behaviour:  {
                    all:        'staging/reports/coverage/behaviour',
                    cucumber:   'staging/reports/coverage/behaviour/cucumber',
                    protractor: 'staging/reports/coverage/behaviour/protractor'
                },
            }
        },
        traspiled: {
            all:            'staging/transpiled',
            src:            'staging/transpiled/src/**/*.js',
            spec:           'staging/transpiled/spec/**/*.js',
            behaviour:  {
                cucumber:   'staging/transpiled/behaviour/cucumber/*.js',
                protractor: 'staging/transpiled/behaviour/protractor/protractor.conf.js'
            },
            export:         'staging/transpiled/src/**/*'
        }
    },
    export:     'lib',

    src:        'src/**/*.ts',
    spec:       'spec/**/*.ts',
    behaviour:   {
        spec:       'behaviour/**/*.ts',
        examples:   [
            'behaviour/**/cucumber/features/**/*',
            'behaviour/**/protractor.conf.js',
            'behaviour/**/resources/**/*'
        ]
    },

    typings:    'typings/index.d.ts'
};