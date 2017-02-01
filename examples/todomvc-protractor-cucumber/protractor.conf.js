const crew = require('serenity-js/lib/stage_crew');

exports.config = {

    baseUrl: 'http://todomvc.com',

    allScriptsTimeout: 110000,

    framework: 'custom',
    frameworkPath: require.resolve('serenity-js'),
    serenity: {
        dialect: 'cucumber',
        crew: [
            crew.serenityBDDReporter(),
            crew.consoleReporter(),
            crew.Photographer.who(_ => _
                .takesPhotosOf(_.Tasks_and_Interactions)
                .takesPhotosWhen(_.Activity_Finishes)
            )
        ]
    },

    specs: [ 'features/**/*.feature' ],
    cucumberOpts: {
        require:    [ 'features/**/*.ts' ],
        format:     'pretty',
        compiler:   'ts:ts-node/register'
    },

    capabilities: {
        browserName: 'chrome',
        chromeOptions: {
            args: [
                'incognito',
                'disable-extensions',
                // 'show-fps-counter=true'
            ]
        },

        // execute tests using 2 browsers running in parallel
        shardTestFiles: true,
        maxInstances: 2
    },

    restartBrowserBetweenTests: true,
    disableChecks: true
};
