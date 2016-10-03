require('ts-node/register');

const crew = require('serenity-js/lib/stage_crew');

exports.config = {

    baseUrl: 'http://todomvc.com',

    allScriptsTimeout: 110000,

    framework: 'custom',
    frameworkPath: require.resolve('protractor-cucumber-framework'),
    specs: [ 'features/**/*.feature' ],
    cucumberOpts: {
        require:    [ 'features/**/*.ts' ],
        format:     'pretty',
        compiler:   'ts:ts-node/register'
    },

    plugins: [{
        path: 'node_modules/serenity-js/lib/serenity-protractor/plugin',
        crew: [
            crew.jsonReporter(),
            crew.consoleReporter(),
            crew.Photographer.who(_ => _
                 .takesPhotosOf(_.Tasks_and_Interactions)
                 .takesPhotosWhen(_.Activity_Finishes)
            )
        ]
    }],

    capabilities: {
        browserName: 'chrome',
        chromeOptions: {
            args: [
                'incognito',
                'disable-extensions',
                // 'show-fps-counter=true'
            ]
        }
    },

    restartBrowserBetweenTests: true,

    onPrepare: function() {
        browser.ignoreSynchronization = false;
    }
};
