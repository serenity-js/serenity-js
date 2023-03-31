module.exports = {
    // fromExtensions: [ 'html', 'htm' ], // /myPage.html -> /myPage
    // toExtensions: [ 'exe', 'zip' ], // /myAsset -> /myAsset.zip (if latter exists)
    redirects: [

        // { from: '/community/events-and-articles.html', to: '' },
        // { from: '/community/index.html',               to: '' },
        // { from: '/community/sponsors.html',            to: '' },
        // { from: '/support.html', to: '' },

        // Serenity/JS v2 website
        {
            from: '/handbook/thinking-in-serenity-js/screenplay-pattern.html',
            to: '/handbook/design/screenplay-pattern'
        },

        { from: '/contributing.html', to: '/contributing' },

        { from: '/handbook/about.html', to: '/handbook/getting-started' },
        { from: '/handbook/demo.html', to: '/handbook/getting-started' },
        { from: '/handbook/design/abilities.html', to: '/api/core/class/Ability' },
        {
            from: [
                '/handbook/design/actors.html',
                '/handbook/thinking-in-serenity-js/actors-and-asynchrony.html'
            ], to: '/api/core/class/Actor'
        },
        { from: '/handbook/design/errors.html', to: '/api/core/class/RuntimeError' },
        { from: '/handbook/design/interactions.html', to: '/api/core/class/Interaction' },
        { from: '/handbook/design/questions.html', to: '/api/core/class/Question' },
        {
            from: [
                '/handbook/design/screenplay-pattern.html',
                '/design/screenplay-pattern.html'
            ], to: '/handbook/design/screenplay-pattern'
        },
        { from: '/handbook/design/tasks.html', to: '/api/core/class/Task' },
        { from: '/handbook/design/the-trouble-with-test-scripts.html', to: '/handbook/design' },

        { from: '/handbook/integration/architecture.html', to: '/handbook/about/architecture' },
        { from: '/handbook/integration/installation.html', to: '/handbook/about/installation' },
        {
            from: '/handbook/integration/jira-and-other-issue-trackers.html',
            to: '/handbook/integration/jira-and-other-issue-trackers'
        },
        { from: '/handbook/integration/runtime-dependencies.html', to: '/handbook/about/installation' },
        { from: '/handbook/integration/serenityjs-and-cucumber.html', to: '/handbook/test-runners/cucumber' },
        { from: '/handbook/integration/serenityjs-and-jasmine.html', to: '/handbook/test-runners/jasmine' },
        { from: '/handbook/integration/serenityjs-and-mocha.html', to: '/handbook/test-runners/mocha' },
        { from: '/handbook/integration/serenityjs-and-protractor.html', to: '/handbook/test-runners/protractor' },
        { from: '/handbook/release-notes/index.html', to: '/changelog' },

        {
            from: [
                '/handbook/integration/serenity-2-migration-guide.html',
                '/handbook/release-notes/serenity-js-2.html',
                '/handbook/release-notes/serenity-js-3.html'
            ], to: '/handbook/about/serenity-js-v3'
        },

        { from: '/handbook/release-notes/versioning.html', to: '/handbook/about/versioning' },

        { from: '/handbook/reporting/artifact-archiver.html', to: '/handbook/reporting/artifact-archiver' },
        { from: '/handbook/reporting/console-reporter.html', to: '/handbook/reporting/console-reporter' },
        { from: '/handbook/reporting/serenity-bdd-reporter.html', to: '/handbook/reporting/serenity-bdd-reporter' },
        { from: '/handbook/reporting/stream-reporter.html', to: '/handbook/reporting/stream-reporter' },
        { from: '/handbook/thinking-in-serenity-js/assertions.html', to: '/handbook/design/assertions' },
        {
            from: [
                '/handbook/thinking-in-serenity-js/hello-serenity-js.html',
                '/handbook/why-serenityjs.html'
            ], to: '/handbook'
        },
        { from: '/handbook/thinking-in-serenity-js/index.html', to: '/handbook/design' },
        { from: '/handbook/thinking-in-serenity-js/test-runners.html', to: '/handbook/test-runners' },
        { from: '/handbook/thinking-in-serenity-js/testing-rest-apis.html', to: '/handbook/api-testing' },
        { from: '/handbook/thinking-in-serenity-js/testing-web-uis.html', to: '/handbook/web-testing/' },

        { from: '/license.html', to: '/license' },
        { from: '/changelog.html', to: '/changelog' },

        // Serenity/JS v2 API docs
        { from: '/modules/assertions',          to: '/api/assertions' },
        { from: '/modules/console-reporter',    to: '/api/console-reporter' },
        { from: '/modules/core',                to: '/api/core' },
        { from: '/modules/cucumber',            to: '/api/cucumber' },
        { from: '/modules/jasmine',             to: '/api/jasmine' },
        { from: '/modules/local-server',        to: '/api/local-server' },
        { from: '/modules/mocha',               to: '/api/mocha' },
        { from: '/modules/protractor',          to: '/api/protractor' },
        { from: '/modules/rest',                to: '/api/rest' },
        { from: '/modules/serenity-bdd',        to: '/api/serenity-bdd' },
        { from: '/modules/webdriverio',         to: '/api/webdriverio' },
    ],
}
