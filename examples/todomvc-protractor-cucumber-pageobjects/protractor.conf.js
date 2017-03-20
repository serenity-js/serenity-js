exports.config = {

    framework: 'custom',

    // To get the awesome Serenity BDD reports, replace this entry:
    // frameworkPath: require.resolve('protractor-cucumber-framework'),

    // with this one:
    frameworkPath: require.resolve('serenity-js'),

    // Yes, that's all you need :-)

    // -----------------------------------------------------------------------------------------------------------------

    baseUrl: 'http://todomvc.com',

    allScriptsTimeout: 110000,

    specs: [ 'features/**/*.feature' ],
    cucumberOpts: {
        require:    [ 'features/**/*.js' ],
        format:     'pretty'
    },

    capabilities: {
        browserName: 'chrome',
        chromeOptions: {
            args: [
                // 'incognito',
                // 'disable-extensions',
                // 'show-fps-counter=true'
            ]
        },

        // execute tests using 2 browsers running in parallel
        shardTestFiles: true,
        maxInstances: 2
    },

    restartBrowserBetweenTests: true
};
