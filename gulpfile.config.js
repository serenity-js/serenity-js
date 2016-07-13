module.exports = {
    staging:   {
        all:        'staging',
        reports:   {
            all:      'staging/reports',
            coverage: 'staging/reports/coverage'
        },
        traspiled: {
            all:    'staging/transpiled',
            src:    'staging/transpiled/src/**/*.js',
            spec:   'staging/transpiled/spec/**/*.js',
            export: 'staging/transpiled/src/**/*'
        }
    },
    export:   'lib',

    src:      'src/**/*.ts',
    spec:     'spec/**/*.ts',

    typings:  'typings/index.d.ts'
};