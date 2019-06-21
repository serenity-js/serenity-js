const
    { ArtifactArchiver, ConsoleReporter, SerenityBDDReporter } = require('@serenity-js/core'),
    { FileSystem, Path } = require('@serenity-js/core/lib/io');

exports.config = {
    chromeDriver: require('chromedriver/lib/chromedriver').path,
    SELENIUM_PROMISE_MANAGER: false,

    directConnect: true,

    allScriptsTimeout: 11000,

    specs: [ 'features/*.feature', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        crew: [
            new ArtifactArchiver(new FileSystem(new Path('./target/site/serenity'))),
            new SerenityBDDReporter(),
            new ConsoleReporter(),
        ]
    },

    cucumberOpts: {
        require: [
            'features/step_definitions/**/*.ts',
            'features/support/setup.ts',
        ],
        'require-module': ['ts-node/register'],
        tags: [],
    },

    capabilities: {
        browserName: 'chrome',

        chromeOptions: {
            args: [
                '--disable-infobars',
                '--no-sandbox',
                '--disable-gpu',
                '--window-size=1024x768',
                '--headless',
            ],
        },
    },
};
