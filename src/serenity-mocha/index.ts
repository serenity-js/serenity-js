import { Serenity } from '../serenity';
import { Outcome, Result, SceneFinished, SceneStarts } from '../serenity/domain';

import { wrapped } from './controlflow';
import { categoryOf, ExecutedScenario, finalStateOf, MochaScene, nameOf, Scenario } from './model';

// todo: [ ] tags: https://medium.com/@andrew_levine/tagging-tests-w-protractor-and-mocha-20b20bc10322#.cngxajsbf
// todo: [ ] initialise serenity
// todo: [ ] Update the tutorials to use See

// commits:
// - verification functions
//  - update the tuts to reflect that

/**
 * Execute the Runner's test cases through Mocha.
 *
 * @param {any} runner The current Protractor Runner.
 * @param {Array} specs Array of Directory Path Strings.
 * @return {Promise} Promise resolved with the test results
 */
exports.run = function run (runner, specs): Promise<any[]> {
    let Mocha = require('mocha'),
        mocha = new Mocha(runner.getConfig().mochaOpts);

    function protractorEvent(scenarioResult: ExecutedScenario) {
        return {
            name:     nameOf(scenarioResult),
            category: categoryOf(scenarioResult),
        };
    }

    return new Promise((resolve, reject) => {

        // Mocha doesn't set up the ui until the pre-require event, so
        // wait until then to load mocha-webdriver adapters as well.
        mocha.suite.on('pre-require', function () {
            try {
                let g: any = global;

                g.after      = wrapped(g.after);
                g.afterEach  = wrapped(g.afterEach);
                g.before     = wrapped(g.before);
                g.beforeEach = wrapped(g.beforeEach);

                g.it         = wrapped(g.it);
                g.it.only    = wrapped(g.iit);
                g.it.skip    = wrapped(g.xit);
            } catch (err) {
                reject(err);
            }
        });

        mocha.loadFiles();

        runner.runTestPreparer().then(function () {
            specs.forEach(file => mocha.addFile(file));

            let results = [];

            let mochaRunner = mocha.run(function (failures) {

                try {
                    let completed = !! runner.getConfig().onComplete
                        ? Promise.resolve(runner.getConfig().onComplete())
                        : Promise.resolve();

                    completed.then(() => resolve({
                        failedCount: failures,
                        specResults: results,
                    }));

                } catch (err) {
                    reject(err);
                }
            });

            mochaRunner.on('test', function(scenario: Scenario) {
                Serenity.notify(new SceneStarts(new MochaScene(scenario)));
            });

            mochaRunner.on('test end', function(scenario: ExecutedScenario) {
                if (finalStateOf(scenario) === Result.PENDING) {
                    Serenity.notify(new SceneStarts(new MochaScene(scenario)));
                }

                Serenity.notify(new SceneFinished(new Outcome(new MochaScene(scenario), finalStateOf(scenario), scenario.err)));
            });

            mochaRunner.on('pass', function (scenario: ExecutedScenario) {
                runner.emit('testPass', protractorEvent(scenario));
                results.push({
                    description: scenario.title,
                    assertions: [ {
                        passed: true,
                    } ],
                    duration: scenario.duration,
                });
            });

            mochaRunner.on('fail', function (scenario: ExecutedScenario) {
                runner.emit('testFail', protractorEvent(scenario));
                results.push({
                    description: scenario.title,
                    assertions: [ {
                        passed: false,
                        errorMsg: scenario.err.message,
                        stackTrace: scenario.err.stack,
                    } ],
                    duration: scenario.duration,
                });
            });
        }, reject);

    });
};
