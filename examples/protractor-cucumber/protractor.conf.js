exports.config = {
    ...require('../../protractor.conf'),

    specs: [ 'features/*.feature', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        crew: [
            // '@serenity-js/core:StreamReporter',
            [ '@serenity-js/console-reporter', { theme: 'auto' } ],
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
            [ '@serenity-js/web:Photographer', {
                strategy: 'TakePhotosOfFailures',
                // strategy: 'TakePhotosOfInteractions',
            } ],
            [ '@serenity-js/serenity-bdd', { specDirectory: 'features' } ],
        ]
    },

    cucumberOpts: {
        require: [
            'features/step_definitions/**/*.ts',
            'features/support/setup.ts',
        ],
        requireModule: ['tsx/cjs'],
    },
};
