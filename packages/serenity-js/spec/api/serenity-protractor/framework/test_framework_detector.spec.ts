import sinon = require('sinon');
import expect = require('../../../expect');
import { CucumberTestFramework } from '../../../../src/serenity-cucumber/cucumber_test_framework';
import { MochaTestFramework } from '../../../../src/serenity-mocha/mocha_test_framework';
import { TestFrameworkDetector } from '../../../../src/serenity-protractor/framework/test_framework_detector';

describe('serenity-protractor', () => {

    describe('framework', () => {

        describe('TestFrameworkDetector', () => {

            const detect = new TestFrameworkDetector();

            describe('Correctly instantiates the required framework', () => {

                describe('when the preferred `dialect`', () => {

                    it('is set to `cucumber`', () => {
                        const framework = detect.frameworkFor({
                            serenity: {
                                dialect: 'cucumber',
                            },

                            configDir: '/path/to/protractor/configuration',
                        });

                        expect(framework).to.be.an.instanceOf(CucumberTestFramework);
                    });

                    it('is set to `mocha`', () => {
                        const framework = detect.frameworkFor({
                            serenity: {
                                dialect: 'mocha',
                            },

                            configDir: '/path/to/protractor/configuration',
                        });

                        expect(framework).to.be.an.instanceOf(MochaTestFramework);
                    });
                });

                describe('when the `dialect` is not set, but the config', () => {

                    it('seems like `cucumber` because of the `cucumberOpts`', () => {
                        const framework = detect.frameworkFor({
                            cucumberOpts: {
                                require:    [ 'features/**/*.ts' ],
                                format:     'pretty',
                            },

                            configDir: '/path/to/protractor/configuration',
                        });

                        expect(framework).to.be.an.instanceOf(CucumberTestFramework);
                    });

                    it('seems like `cucumber` because of the `cucumberOpts` defined in capabilities', () => {
                        const framework = detect.frameworkFor({
                            capabilities: {
                                cucumberOpts: {
                                    require:    [ 'features/**/*.ts' ],
                                    format:     'pretty',
                                },
                            },

                            configDir: '/path/to/protractor/configuration',
                        });

                        expect(framework).to.be.an.instanceOf(CucumberTestFramework);
                    });

                    it('seems like `mocha` because of the `mochaOpts`', () => {
                        const framework = detect.frameworkFor({
                            mochaOpts: {
                                ui:    'bdd',
                            },
                        });

                        expect(framework).to.be.an.instanceOf(MochaTestFramework);
                    });

                    it('seems like `mocha` because of the `mochaOpts` defined in capabilities', () => {
                        const framework = detect.frameworkFor({
                            capabilities: {
                                mochaOpts: {
                                    ui:    'bdd',
                                },
                            },
                        });

                        expect(framework).to.be.an.instanceOf(MochaTestFramework);
                    });

                });
            });

            describe('When the framework could not be detected', () => {

                it('advises how it can be fixed', () => {
                    expect(() => detect.frameworkFor({
                        // no relevant config
                    })).to.throw(
                        'Serenity/JS could not determine the test dialect you wish to use. ' +
                        'Please add `serenity: { dialect: \'...\' }` to your Protractor configuration file ' +
                        'and choose one of the following options: cucumber, mocha.',
                    );
                });
            });

            describe('When the framework is not (yet) supported', () => {

                it('advises how to contact the Serenity/JS team', () => {
                    expect(() => detect.frameworkFor({
                        serenity: {
                            dialect: 'something-new',
                        },
                    } as any)).to.throw(
                        'Serenity/JS does not (yet) support the \'something-new\' test framework. ' +
                        'Please let us know on github if you\'d like to see it added!',
                    );
                });
            });
        });

    });
});
