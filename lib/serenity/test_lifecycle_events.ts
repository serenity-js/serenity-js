import {DomainEvent, DomainEventHandler} from "./domain_events";
import {InterfaceDescriptor} from "./typesafety";

/*
 Domain events:
 - Test Started                          // cucumber scenario or a mocha test
    - Test Step Started                 // cucumber step or screenplay test
        - Test Step Started/Finished
        ...
    ...
 - Test Step Finished
 ...
 - Test Step Finished
 ...

 - Test Finished
 */

// todo: maybe use reflect-metadata instead of all those hand-roller interface descriptors?

export class TestStarted implements DomainEvent<string> {
    value():string {
        return "test started";
    }

    static get interface(): {new (): InterfaceDescriptor} {
        return TestStartedInterface;
    }
}

export class TestStartedInterface implements InterfaceDescriptor {
    methodNames:string[] = ['value'];
    className:string     = 'TestStartedInterface';
}

export class TestFinished implements DomainEvent<string> {
    value():string {
        return "test finished";
    }

    static get interface(): {new (): InterfaceDescriptor} {
        return TestFinishedInterface;
    }
}

export class TestFinishedInterface implements InterfaceDescriptor {
    methodNames:string[] = ['value'];
    className:string     = 'TestFinishedInterface';
}

export class TestStepStarted implements DomainEvent<string> {
    value():string {
        return "test step started";
    }

    static get interface(): {new (): InterfaceDescriptor} {
        return TestStepStartedInterface;
    }
}

export class TestStepStartedInterface implements InterfaceDescriptor {
    methodNames:string[] = ['value'];
    className:string     = 'TestStepStartedInterface';
}

export class TestStepFinished implements DomainEvent<string> {
    value():string {
        return "test step finished";
    }

    static get interface(): {new (): InterfaceDescriptor} {
        return TestStepFinishedInterface;
    }
}

export class TestStepFinishedInterface implements InterfaceDescriptor {
    methodNames:string[] = ['value'];
    className:string     = 'TestStepFinishedInterface';
}

// ----------------------------------------------------------------------------
// event handlers

export interface TestStartedHandler extends DomainEventHandler {
    onTestStarted(event: TestStarted);
}

export interface TestLifecycleListener extends DomainEventHandler {
    onTestStarted(event: TestStarted);
    onTestFinished(event: TestFinished);
    onTestStepStarted(event: TestStepStarted);
    onTestStepFinished(event: TestStepFinished);
}

export class TestLifecycleListenerInterface implements InterfaceDescriptor {
    methodNames = [
        'onTestStarted', 'onTestFinished',
        'onTestStepStarted', 'onTestStepFinished'
    ];
    className   = 'TestLifecycleListenerInterface';
}