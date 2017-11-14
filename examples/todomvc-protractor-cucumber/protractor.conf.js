const crew = require('serenity-js/lib/stage_crew');

var _            = require('lodash'),
    path         = require('path'),
    protractor   = require.resolve('protractor'),
    node_modules = protractor.substring(0, protractor.lastIndexOf('node_modules') + 12);

exports.config = {

    seleniumServerJar: path.resolve(node_modules, 'protractor/node_modules/webdriver-manager/selenium/selenium-server-standalone-3.0.1.jar'),

    baseUrl: 'http://todomvc.com',

    allScriptsTimeout: 110000,

    framework: 'custom',
    frameworkPath: require.resolve('serenity-js'),
    serenity: {
        dialect: 'cucumber',
        crew: [
            crew.serenityBDDReporter()
            // ,
            // crew.consoleReporter(),
            // crew.Photographer.who(_ => _
            //     .takesPhotosOf(_.Failures)
            //     .takesPhotosWhen(_.Activity_Finishes)
            // )
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
                '--disable-infobars'
                // '--incognito',
                // '--disable-extensions',
                // '--show-fps-counter=true'
            ]
        }
        // ,

        // execute tests using 2 browsers running in parallel
        // shardTestFiles: true,
        // maxInstances: 2
    },

    restartBrowserBetweenTests: false
};
