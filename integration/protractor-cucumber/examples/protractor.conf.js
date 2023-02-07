const { NoOpDiffFormatter } = require('@serenity-js/core');
const { Actors } = require('./Actors');

exports.config = {
    ...require('../../../protractor.conf'),

    specs: [ 'features/*.feature', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        runner: 'cucumber',
        actors: new Actors(),
        diffFormatter: new NoOpDiffFormatter(),
        // don't register the crew in here to allow for a native cucumber reporter test register a custom formatter
    },

    cucumberOpts: {
        require: [
            'features/step_definitions/**/*.js',
        ],
    },
};
