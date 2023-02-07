const
    { NoOpDiffFormatter, StreamReporter } = require('@serenity-js/core'),
    { ChildProcessReporter } = require('@integration/testing-tools'),
    { Actors } = require('./Actors');

exports.config = {
    ...require('../../../protractor.conf'),

    specs: [ '*.spec.js', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        runner: 'mocha',
        actors: new Actors(),
        diffFormatter: new NoOpDiffFormatter(),
        crew: [
            new ChildProcessReporter(),
            new StreamReporter(),
        ]
    },

    mochaOpts: {

    },
};
