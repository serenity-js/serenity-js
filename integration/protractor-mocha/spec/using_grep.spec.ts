import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput } from '@integration/testing-tools';
import { TestRunFinished, TestRunFinishes } from '@serenity-js/core/lib/events';
import { protractor } from '../src/protractor';

describe('@serenity-js/mocha', function () {

    this.timeout(30000);

    it('allows for selective execution of scenarios via grep', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/failing.spec.js',
            '--mochaOpts.grep=".*passes.*"',
        )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(res => {

                expect(res.exitCode).to.equal(0);

                // Unlike Jasmine, Mocha won't even touch the scenarios that have been excluded using grep
                // so they won't emit any events
                expect(res.events).to.have.lengthOf(2);

                expect(res.events[0]).to.be.instanceOf(TestRunFinishes);
                expect(res.events[1]).to.be.instanceOf(TestRunFinished);
            }));
});
