exports.config = {
    chromeDriver: require('chromedriver/lib/chromedriver').path,
    SELENIUM_PROMISE_MANAGER: false,

    directConnect: true,

    allScriptsTimeout: 11000,

    specs: [ 'features/*.feature', ],

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    cucumberOpts: {
        require: [
            'features/step_definitions/**/*.ts',
            'features/support/configure_serenity.ts',
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
