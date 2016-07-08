module.exports = {
    target:   {
        all:        'out',
        reports:   {
            all:      'out/reports',
            coverage: 'out/reports/coverage'
        },
        traspiled: {
            all:    'out/transpiled',
            src:    'out/transpiled/src/**/*.js',
            spec:   'out/transpiled/spec/**/*.js',
        }
    },
    src:      'src/**/*.ts',
    spec:     'spec/**/*.ts',

    typings:  'typings/index.d.ts'
};