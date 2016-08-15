require('ts-node/register');

exports.config = {

    /* LOCALHOST CONFIG */
    // seleniumServerJar: "node_modules/protractor/selenium/selenium-server-standalone-2.52.0.jar",
    // baseUrl: 'http://localhost:3000/',

    exclude: [],

    framework: 'jasmine2',
    specs: [ 'spec/**/*.ts' ],

    onPrepare: function() {
        var Notifier = require('serenity-bdd/lib/serenity-jasmine').Notifier;

        jasmine.getEnv().addReporter(new Notifier());
    },

    plugins: [{
        path: 'node_modules/serenity-bdd/lib/serenity-protractor/adapter'
    }],

    capabilities: {
        browserName: 'chrome'
    },

    restartBrowserBetweenTests: true
};