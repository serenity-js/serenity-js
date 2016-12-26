// based on my PR to DefinitelyTyped:
//      https://github.com/DefinitelyTyped/DefinitelyTyped/pull/9729
//
// Library code based on:
//      https://github.com/cucumber/cucumber-js/blob/dc698bf5bc10d591fa7adeec5fa21b2d90dc9679/lib/cucumber/support_code/library.js

declare namespace cucumber {

    export interface CallbackStepDefinition {
        pending: () => PromiseLike<any>;
        (errror?: any, pending?: string): void;
    }

    interface StepDefinitionCode {
        (...stepArgs: Array<string |CallbackStepDefinition>): PromiseLike<any> | any | void;
    }

    interface StepDefinitionOptions {
        timeout?: number;
    }

    export interface StepDefinitions {
        Given(pattern: RegExp | string, options: StepDefinitionOptions, code: StepDefinitionCode): void;
        Given(pattern: RegExp | string, code: StepDefinitionCode): void;
        When(pattern: RegExp | string, options: StepDefinitionOptions, code: StepDefinitionCode): void;
        When(pattern: RegExp | string, code: StepDefinitionCode): void;
        Then(pattern: RegExp | string, options: StepDefinitionOptions, code: StepDefinitionCode): void;
        Then(pattern: RegExp | string, code: StepDefinitionCode): void;
        setDefaultTimeout(time: number): void;
    }

    export interface Hooks {
        Before(code: SimpleHook): void;
        After(code: SimpleHook): void;
        Around(code: AroundHook): void;
        setDefaultTimeout(time: number): void;
        registerHandler(handlerOption: string, code: (event: any, callback: CallbackStepDefinition) =>void): void;
        registerListener(listener: EventListener): void;
    }

    // -- Listener

    export class EventListener {
        hear(event: events.Event, callback: ()=>void);

        hasHandlerForEvent(event: events.Event): boolean;

        buildHandlerNameForEvent(event: events.Event);

        getHandlerForEvent(event: events.Event): EventHook;

        buildHandlerName(shortName: string): string;

        setHandlerForEvent(shortName: string, handler: EventListener);
    }

    export function Listener(): EventListener;

    // todo: review the interface signatures
    export namespace events {

        interface Event {
            getName(): string;
            getPayloadItem(name: string): EventPayload;
        }

        interface EventPayload {
        }

        interface FeaturesPayload extends EventPayload {
            addFeature(feature): any;
            getFeatures(): any[];                   // https://github.com/cucumber/cucumber-js/blob/dc698bf5bc10d591fa7adeec5fa21b2d90dc9679/lib/cucumber/runtime.js#L34
            getLastFeature(): any;
            acceptVisitor(visitor, callback): any;
        }

        interface FeaturesResultPayload extends EventPayload {
            getDuration(): any;
            getScenarioCounts(): any;
            getStepCounts(): any;
            isSuccessful(): boolean;
            witnessScenarioResult(scenarioResult): void;
            witnessStepResult(stepResult): void;
        }

        interface FeaturePayload extends EventPayload {
            getStepKeywordByLines(): any; // todo ?
            getScenarioKeyword(): string;
            getKeyword(): string;
            getName(): string;
            getDescription(): string;
            getUri(): string;
            getLine(): number;
            getTags(): Tag[];
            getScenarios(): ScenarioPayload[]; // todo ?
            getPayloadItem(): FeaturePayload;
        }

        interface ScenarioPayload extends EventPayload {
            getName(): string;
            getKeyword(): string;
            getDescription(): string;
            getFeature(): FeaturePayload;
            setFeature(feature: FeaturePayload);
            getUri(): string;
            getUris(): string[]; // todo: ?
            getLine(): number;
            getLines(): number[]; // todo: ?
            getTags(): Tag[];
            getSteps(): any[];
            getPayloadItem(): ScenarioPayload;
        }

        interface ScenarioResultPayload extends EventPayload {
            getFailureException(): Error;
            getScenario(): any;
            getStatus(): any;
            witnessStepResult(stepResult): void;
            witnessStepWithStatis(stepStatus): void;
        }

        interface StepPayload extends EventPayload {
            setPreviousStep(newPreviousStep): void;
            isHidden(): boolean;
            isOutlineStep(): boolean;
            getKeyword(): string;
            getName(): string;
            hasUri(): boolean;
            getUri(): string;
            getLine(): number;
            getPreviousStep(): any;
            hasPreviousStep(): boolean;
            getAttachment(): any;
            getAttachmentContents(): any;
            getDocString(): string;
            getDataTable(): any;
            hasAttachment(): boolean;
            hasDocString(): boolean;
            hasDataTable(): boolean;
            attachDocString(_docString): void;
            attachDataTable(_dataTable): void;
            attachDataTableRow(row): void;
            ensureDataTableIsAttached(): void;
            isOutcomeStep(): boolean;
            isEventStep(): boolean;
            hasOutcomeStepKeyword(): boolean;
            hasEventStepKeyword(): boolean;
            isRepeatingOutcomeStep(): boolean;
            isRepeatingEventStep(): boolean;
            hasRepeatStepKeyword(): boolean;
            isPrecededByOutcomeStep(): boolean;
            isPrecededByEventStep(): boolean;
        }

        interface StepResultPayload extends EventPayload {
            getAmbiguousStepDefinitions(): any[];
            getAttachments(): any[];
            getDuration(): any;
            getFailureException(): Error;
            getStep(): any;
            getStepDefinition(): any;
            getStatus(): any;
            hasAttachments(): boolean;
        }

    }

    interface Tag {
        getName(): string;
        getLine(): number;
    }

    export interface Scenario {
        getKeyword(): string;
        getName(): string;
        getDescription(): string;
        getUri(): string;
        getLine(): number;
        getTags(): Tag[];
        getException(): Error;
        getAttachments(): any[];
        attach(data: any, mimeType?: string, callback?: (err?: any) => void): void;
        isSuccessful(): boolean;
        isFailed(): boolean;
        isPending(): boolean;
        isUndefined(): boolean;
        isSkipped(): boolean;
    }

    interface EventHook {
        (event: events.Event, callback?: ()=>void): void;
    }

    interface SimpleHook {
        (scenario: Scenario, callback?: CallbackStepDefinition): void;
    }

    interface AroundHook {
        (scenario: Scenario, runScenario?: (error: string, callback?: Function)=>void): void;
    }
}

declare module 'cucumber' {
    export = cucumber;
}
