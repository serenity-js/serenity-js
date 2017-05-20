import { Result } from '@serenity-js/core/lib/domain';

import { given } from 'mocha-testdata';
import { CucumberAdapter } from '../src/cucumber_adapter';
import { spawner } from './spawner/spawner';
import path = require('path');

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;

describe('cucumber-2', () => {
    describe('CucumberAdapter', function() {

        this.timeout(30 * 1000);

        const cucumber = (spec: string, scenario: string, ...options: string[]) => spawner('./adapted-cucumber', {
            cwd: __dirname,
            silent: true,
        } )(
            '--name', scenario,
            '--require', 'features/step_definitions/steps.ts',
            ...options,
            spec,
        );

        given(
            [ 'A passing scenario with a synchronous interface', 'Given a step that passes with a synchronous interface'],
            [ 'A passing scenario with a callback interface',    'Given a step that passes with a callback interface'   ],
            [ 'A passing scenario with a promise interface',     'Given a step that passes with a promise interface'    ],
        ).
        it('reports passing scenarios', (scenario: string, step: string) => {
            const spawned = cucumber('features/*passing_scenario.feature', scenario);

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(4);

                expect(spawned.messages[0].value.name).to.equal(scenario);
                expect(spawned.messages[1].value.name).to.equal(step);
                expect(spawned.messages[2].value.subject.name).to.equal(step);
                expect(spawned.messages[3].value.subject.name).to.equal(scenario);
            });
        });

        it ('ignores skipped scenarios', () => {
            const spawned = cucumber('features/*skipped_scenario.feature', 'A skipped scenario', '--tags', 'not @wip');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(0);
            });
        });

        it ('reports implicitly pending scenarios', () => {
            const scenario = 'An implicitly pending scenario',
                  step     = 'Given a scenario with no defined steps';

            const spawned = cucumber('**/*implicitly_pending_scenario.feature', scenario, '--no-strict');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(4);

                expect(spawned.messages[0].value.name).to.equal(scenario);
                expect(spawned.messages[1].value.name).to.equal(step);
                expect(spawned.messages[2].value.subject.name).to.equal(step);
                expect(Result[spawned.messages[3].value.result]).to.equal(Result[Result.PENDING]);
                expect(spawned.messages[3].value.subject.name).to.equal(scenario);
                expect(Result[spawned.messages[3].value.result]).to.equal(Result[Result.PENDING]);
            });
        });

        given(
            [ 'An explicitly pending synchronous scenario', 'Given a pending step with a synchronous interface'],
            [ 'An explicitly pending callback scenario',    'Given a pending step with a callback interface'   ],
            [ 'An explicitly pending promise scenario',     'Given a pending step with a promise interface'    ],
        ).
        it ('reports explicitly pending scenarios', (scenario: string, step: string) => {
            const spawned = cucumber('**/*explicitly_pending_scenario.feature', scenario, '--no-strict');

            return expect(spawned.result).to.be.eventually.fulfilled.then(() => {
                expect(spawned.messages).to.have.lengthOf(4);

                expect(spawned.messages[0].value.name).to.equal(scenario);
                expect(spawned.messages[1].value.name).to.equal(step);
                expect(spawned.messages[2].value.subject.name).to.equal(step);
                expect(Result[spawned.messages[3].value.result]).to.equal(Result[Result.PENDING]);
                expect(spawned.messages[3].value.subject.name).to.equal(scenario);
                expect(Result[spawned.messages[3].value.result]).to.equal(Result[Result.PENDING]);
            });
        });

        given(
            [ 'A failing scenario with a synchronous interface', 'Given a step that fails with a synchronous interface'],
            [ 'A failing scenario with a callback interface',    'Given a step that fails with a callback interface'   ],
            [ 'A failing scenario with a promise interface',     'Given a step that fails with a promise interface'    ],
        ).
        it('reports failing scenarios', (scenario: string, step: string) => {
            const spawned = cucumber('**/*failing_scenario.feature', scenario);

            return expect(spawned.result).to.be.eventually.rejected.then(() => {
                expect(spawned.messages).to.have.lengthOf(4);

                expect(spawned.messages).to.have.lengthOf(4);

                expect(spawned.messages[0].value.name).to.equal(scenario);
                expect(spawned.messages[1].value.name).to.equal(step);
                expect(spawned.messages[2].value.subject.name).to.equal(step);
                expect(Result[spawned.messages[3].value.result]).to.equal(Result[Result.FAILURE]);
                expect(spawned.messages[3].value.subject.name).to.equal(scenario);
                expect(Result[spawned.messages[3].value.result]).to.equal(Result[Result.FAILURE]);
            });
        });
    });
});
