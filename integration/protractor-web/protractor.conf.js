const { NoOpDiffFormatter } = require('@serenity-js/core');

exports.config = {

    ...require('../../protractor.conf'),

    specs: [
        './node_modules/@integration/web-specs/spec/**/*.spec.ts',
        './spec/**/*.spec.ts',
    ],
    exclude: [
        './node_modules/@integration/web-specs/spec/**/PageElement.located.ByRole.spec.ts'
    ],

    baseUrl: `http://localhost:${ process.env.PORT || 8080 }`,
    framework:      'custom',

    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        runner: 'mocha',
        diffFormatter: new NoOpDiffFormatter(),
        crew: [
            // [ '@serenity-js/console-reporter', { theme: 'dark' } ],
            [ '@integration/testing-tools:TestRunnerTagger', 'protractor' ],
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: `${ process.cwd() }/target/site/serenity` } ],
            [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' } ],
            [ '@serenity-js/serenity-bdd', { specDirectory: '.' } ],
        ]
        .concat(process.env.CI && [ [ '@serenity-js/console-reporter', { theme: 'dark' } ] ])
        .filter(Boolean)
    },
};
