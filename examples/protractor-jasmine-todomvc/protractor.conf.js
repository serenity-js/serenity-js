exports.config = {
    ...require('../../protractor.conf'),

    specs: [ 'spec/**/*.spec.ts', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        runner: 'jasmine',
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

    onPrepare: function() {
        require('ts-node/register');

        /**
         * If you're interacting with a non-Angular application,
         * uncomment the below onPrepare section,
         * which disables Angular-specific test synchronisation.
         */
        // browser.waitForAngularEnabled(false);
    },

    jasmineNodeOpts: {
        requires: [
        ],
        helpers: [
            'spec/config/*.ts'
        ]
    },
};
