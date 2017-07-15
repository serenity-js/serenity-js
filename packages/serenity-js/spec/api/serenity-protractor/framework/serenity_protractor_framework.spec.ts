import { Serenity } from '@serenity-js/core';
import { ConsoleReporter, SerenityBDDReporter } from '@serenity-js/core/lib/reporting';
import { Config, ProtractorBrowser } from 'protractor';
import { Runner } from 'protractor/built/runner';
import { SinonStub } from 'sinon';

import { SerenityProtractorFramework } from '../../../../src/serenity-protractor/framework/serenity_protractor_framework';
import { StandIns } from '../../../../src/serenity-protractor/framework/stand_ins';
import { ProtractorNotifier } from '../../../../src/serenity-protractor/reporting/protractor_notifier';
import { ProtractorReporter } from '../../../../src/serenity-protractor/reporting/protractor_reporter';
import { Photographer } from '../../../../src/serenity-protractor/stage/photographer';

import sinon = require('sinon');
import expect = require('../../../expect');
import { ProtractorBrowserDetector } from '../../../../src/serenity-protractor/reporting/protractor_browser_detector';

describe('serenity-protractor', () => {

    describe('framework', () => {

        describe('SerenityProtractorFramework', () => {

            const serenity = new Serenity();

            beforeEach(() => { sinon.spy(serenity, 'configure'); });
            afterEach(() => { (serenity.configure as SinonStub).restore(); });

            it('can be instantiated with a default crew', () => {

                const framework = new SerenityProtractorFramework(serenity, protractorRunner.withConfiguration({
                    serenity: {
                        dialect: 'mocha',
                    },
                }), protractorBrowser('chrome'));

                expect(framework).to.be.instanceOf(SerenityProtractorFramework);
                expect(serenity.configure).to.have.been.calledWith(sinon.match({
                    crew: [
                        some(SerenityBDDReporter),
                        some(Photographer),
                        // core crew:
                        some(ProtractorReporter),
                        some(ProtractorBrowserDetector),
                        some(StandIns),
                        some(ProtractorNotifier),
                    ],
                }));
            });

            it('can be instantiated with a custom crew, which overrides the default one (except the "protractor core" crew members)', () => {

                const framework = new SerenityProtractorFramework(serenity, protractorRunner.withConfiguration({
                    serenity: {
                        dialect: 'mocha',
                        crew: [
                            new ConsoleReporter(console.log),
                        ],
                    },
                }), protractorBrowser('chrome'));

                expect(framework).to.be.instanceOf(SerenityProtractorFramework);
                expect(serenity.configure).to.have.been.calledWith(sinon.match({
                    crew: [
                        some(ConsoleReporter),
                        // core crew:
                        some(ProtractorReporter),
                        some(ProtractorBrowserDetector),
                        some(StandIns),
                        some(ProtractorNotifier),
                    ],
                }));
            });

            it('advises the developer what to do if the dialect could not be detected automatically', () => {
                expect(() => {
                    const framework = new SerenityProtractorFramework(serenity, protractorRunner.withConfiguration({}), protractorBrowser('chrome'));
                }).to.throw([
                    'Serenity/JS could not determine the test dialect you wish to use. ',
                    'Please add `serenity: { dialect: \'...\' }` to your Protractor configuration ',
                    'file and choose one of the following options: cucumber, mocha.',
                ].join(''));
            });
        });

        const protractorRunner = {
            withConfiguration: (config: Config) => {
                const r: Runner = sinon.createStubInstance(Runner);

                (r.getConfig as SinonStub).returns(config);

                return r;
            },
        };

        const protractorBrowser = (browserName: string) => {
            const browser = {
                getCapabilities: () => Promise.resolve({
                    get: (capability: string) => browserName,
                }),
            };

            return browser as any;
        };

        const some = sinon.match.instanceOf;
    });
});
