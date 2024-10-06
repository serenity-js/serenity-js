exports.config = {
    ...require('../../protractor.conf'),

    specs: [ 'spec/*.spec.ts', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        runner: 'mocha',
        crew: [
            // '@serenity-js/core:StreamReporter',
            [ '@serenity-js/console-reporter', { theme: 'auto' } ],
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
            [ '@serenity-js/web:Photographer', {
                strategy: 'TakePhotosOfFailures',
                // strategy: 'TakePhotosOfInteractions',
            } ],
            [ '@serenity-js/serenity-bdd', { specDirectory: 'spec' } ],
        ]
    },

    // Retrying failed scenarios also works in combination with restarting the browser:
    // restartBrowserBetweenTests: true,

    mochaOpts: {
        require: [
            'tsx/cjs',
        ],
        retries: 2
    },
};
