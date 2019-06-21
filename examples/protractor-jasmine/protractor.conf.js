const
    path = require('path'),
    { FileSystem, Path } = require('@serenity-js/core/lib/io'),
    { ArtifactArchiver, ConsoleReporter, SerenityBDDReporter } = require('@serenity-js/core');

exports.config = {
    chromeDriver: require('chromedriver/lib/chromedriver').path,
    SELENIUM_PROMISE_MANAGER: false,

    directConnect: true,

    allScriptsTimeout: 11000,

    specs: [ 'spec/*.spec.ts', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        runner: 'jasmine',
        crew: [
            new ArtifactArchiver(new FileSystem(new Path('./target/site/serenity'))),
            new SerenityBDDReporter(),
            new ConsoleReporter(),
        ]
    },

    jasmineNodeOpts: {
        requires: [
            'ts-node/register',
            path.resolve(__dirname, 'node_modules/@serenity-js/jasmine'),
        ],
        helpers: [
            'spec/config/*.ts'
        ]
    },

    capabilities: {
        browserName: 'chrome',

        chromeOptions: {
            args: [
                '--disable-infobars',
                '--no-sandbox',
                '--disable-gpu',
                '--window-size=1024x768',
                // '--headless',
            ],
        },
    },
};
