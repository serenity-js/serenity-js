import { Config } from 'protractor';
import { Runner } from 'protractor/built/runner';
import { SinonStub } from 'sinon';
import { SerenityProtractorFramework } from '../../../../src/serenity-protractor/framework/serenity_protractor_framework';
import { StandIns } from '../../../../src/serenity-protractor/framework/stand_ins';
import { ProtractorNotifier } from '../../../../src/serenity-protractor/reporting/protractor_notifier';
import { ProtractorReporter } from '../../../../src/serenity-protractor/reporting/protractor_reporter';
import { Photographer } from '../../../../src/serenity-protractor/stage/photographer';
import { SerenityBDDReporter } from '../../../../src/serenity/reporting/serenity_bdd_reporter';
import { Serenity } from '../../../../src/serenity/serenity';
import { ConsoleReporter } from '../../../../src/serenity/stage/console_reporter';

import sinon = require('sinon');
import expect = require('../../../expect');

describe('serenity-protractor', () => {

    describe('framework', () => {

        describe('SerenityProtractorFramework', () => {

            let serenity;

            beforeEach(() => {
                serenity = sinon.createStubInstance(Serenity);
            });

            it('can be instantiated with a default crew', () => {

                const framework = new SerenityProtractorFramework(serenity, protractorRunner.withConfiguration({
                    serenity: {
                        dialect: 'mocha',
                    },
                }));

                expect(framework).to.be.instanceOf(SerenityProtractorFramework);
                expect(serenity.assignCrewMembers).to.have.been.calledWith(
                    some(SerenityBDDReporter),
                    some(Photographer),
                    // core crew:
                    some(ProtractorReporter),
                    some(StandIns),
                    some(ProtractorNotifier),
                );
            });

            it('can be instantiated with a custom crew, which overrides the default one (except the "protractor core" crew members)', () => {

                const framework = new SerenityProtractorFramework(serenity, protractorRunner.withConfiguration({
                    serenity: {
                        dialect: 'mocha',
                        crew: [
                            new ConsoleReporter(console.log),
                        ],
                    },
                }));

                expect(framework).to.be.instanceOf(SerenityProtractorFramework);
                expect(serenity.assignCrewMembers).to.have.been.calledWith(
                    some(ConsoleReporter),
                    // core crew:
                    some(ProtractorReporter),
                    some(StandIns),
                    some(ProtractorNotifier),
                );
            });
        });

        const protractorRunner = {
            withConfiguration: (config: Config) => {
                const r: Runner = sinon.createStubInstance(Runner);

                (r.getConfig as SinonStub).returns(config);

                return r;
            },
        };

        const some = sinon.match.instanceOf;
    });
});
