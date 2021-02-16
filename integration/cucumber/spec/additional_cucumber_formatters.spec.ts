import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput } from '@integration/testing-tools';
import { given } from 'mocha-testdata';
import { CucumberRunner, cucumberVersions } from '../src';

describe('@serenity-js/cucumber', function () {

    this.timeout(5000);

    given([
        ...cucumberVersions(1, 2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/index.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--no-colors',
                '--format', 'summary',
            )
            .toRun('features/passing_scenario.feature'),

        ...cucumberVersions(3, 4, 5, 6)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
                '--format', 'summary',
            )
            .toRun('features/passing_scenario.feature'),
    ]).
    it('supports native cucumber formatters', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            expect(res.stdout).to.match(/1 scenario.*?1 passed.*?\n1 step.*?1 passed/);
        }));
});
