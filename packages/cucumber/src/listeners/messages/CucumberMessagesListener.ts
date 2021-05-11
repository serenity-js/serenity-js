// import type { Formatter, formatterHelpers } from '@cucumber/cucumber';
import { IdGenerator, messages } from '@cucumber/messages';
import { Serenity } from '@serenity-js/core';
import { DomainEvent, TestRunFinished, TestRunFinishes, TestRunStarts } from '@serenity-js/core/lib/events';
import { ModuleLoader } from '@serenity-js/core/lib/io';

import { CucumberMessagesParser } from './parser/CucumberMessagesParser';
import { IParsedTestStep } from './types/cucumber';

export = function (serenity: Serenity, moduleLoader: ModuleLoader) {    // eslint-disable-line @typescript-eslint/explicit-module-boundary-types

    const
        { Formatter, formatterHelpers } = moduleLoader.require('@cucumber/cucumber'),
        TestCaseHookDefinition          = moduleLoader.require('@cucumber/cucumber/lib/models/test_case_hook_definition').default;

    return class CucumberMessagesListener extends Formatter {
        static readonly fakeInternalAfterHookUri = '/internal/serenity-js/cucumber';

        readonly parser: CucumberMessagesParser;

        log: (buffer: string | Uint8Array) => void;
        supportCodeLibrary: any;

        constructor(options) {
            super(options);

            this.parser = new CucumberMessagesParser(
                serenity,
                formatterHelpers,
                options,
                (step: IParsedTestStep) =>
                    step?.actionLocation?.uri !== CucumberMessagesListener.fakeInternalAfterHookUri,
            );

            this.addAfterHook((message: { testCaseStartedId: string, result: messages.TestStepFinished.ITestStepResult }) => {
                this.emit(this.parser.parseTestCaseFinishes(message));

                return serenity.waitForNextCue();
            });

            options.eventBroadcaster.on('envelope', (envelope: messages.IEnvelope) => {
                // this.log('> [cucumber] ' + JSON.stringify(envelope) + '\n');

                switch (true) {
                    case !! envelope.testRunStarted:
                        return this.emit(new TestRunStarts(serenity.currentTime()));

                    case !! envelope.testCaseStarted:
                        return this.emit(
                            this.parser.parseTestCaseStarted(envelope.testCaseStarted),
                        );

                    case !! envelope.testStepStarted:
                        return this.emit(
                            this.parser.parseTestStepStarted(envelope.testStepStarted),
                        );

                    case !! envelope.testStepFinished:
                        return this.emit(
                            this.parser.parseTestStepFinished(envelope.testStepFinished),
                        );

                    case !! envelope.testCaseFinished:
                        return this.emit(
                            this.parser.parseTestCaseFinished(envelope.testCaseFinished),
                        );
                }
            });
        }

        public async finished(): Promise<void> {
            this.emit(new TestRunFinishes(serenity.currentTime()));

            await serenity.waitForNextCue();
            await super.finished();

            this.emit(new TestRunFinished(serenity.currentTime()));
        }

        addAfterHook(code: (...args: any) => Promise<void> | void) {
            this.supportCodeLibrary.afterTestCaseHookDefinitions.unshift(
                new TestCaseHookDefinition({
                    code,
                    id:     IdGenerator.uuid()(),
                    line:   0,
                    uri:    CucumberMessagesListener.fakeInternalAfterHookUri,
                    options: {},
                }),
            );
        }

        emit(events: DomainEvent[] | DomainEvent): void {
            [].concat(events).forEach(event => serenity.announce(event));
        }
    }
}
