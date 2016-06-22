import {DomainEvent, DomainEventHandler} from "./eventbus";
import {RuntimeInterfaceDescriptor} from "../typesafety";
import {Test, TestResult} from "../domain";


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

export class TestIsStarted extends DomainEvent<Test> {
    static get interface(): {new (): RuntimeInterfaceDescriptor} {
        return TestIsStartedInterface;
    }
}

export class TestIsStartedInterface implements RuntimeInterfaceDescriptor {
    methodNames:string[] = ['value'];
    className:string     = 'TestIsStartedInterface';
}

export class TestIsFinished extends DomainEvent<Test> {
    static get interface(): {new (): RuntimeInterfaceDescriptor} {
        return TestIsFinishedInterface;
    }
}

export class TestIsCompleted extends DomainEvent<TestResult> {
    static get interface(): {new (): RuntimeInterfaceDescriptor} {
        return TestIsCompletedInterface;
    }
}

export class TestIsCompletedInterface implements RuntimeInterfaceDescriptor {
    methodNames:string[] = ['value'];
    className:string     = 'TestIsCompletedInterface';
}


export class TestIsFinishedInterface implements RuntimeInterfaceDescriptor {
    methodNames:string[] = ['value'];
    className:string     = 'TestIsFinishedInterface';
}

export class TestStepIsStarted extends DomainEvent<string> {
    static get interface(): {new (): RuntimeInterfaceDescriptor} {
        return TestStepIsStartedInterface;
    }
}

export class TestStepIsStartedInterface implements RuntimeInterfaceDescriptor {
    methodNames:string[] = ['value'];
    className:string     = 'TestStepIsStartedInterface';
}

export class TestStepIsCompleted extends DomainEvent<string> {
    static get interface(): {new (): RuntimeInterfaceDescriptor} {
        return TestStepIsFinishedInterface;
    }
}

export class TestStepIsCompletedInterface implements RuntimeInterfaceDescriptor {
    methodNames:string[] = ['value'];
    className:string     = 'TestStepIsCompletedInterface';
}

export class TestStepIsFinished extends DomainEvent<string> {
    static get interface(): {new (): RuntimeInterfaceDescriptor} {
        return TestStepIsFinishedInterface;
    }
}

export class TestStepIsFinishedInterface implements RuntimeInterfaceDescriptor {
    methodNames:string[] = ['value'];
    className:string     = 'TestStepIsFinishedInterface';
}

// ----------------------------------------------------------------------------
// event handlers

export interface TestLifecycleListener extends DomainEventHandler {
    whenTestIsStarted       (event: TestIsStarted);
    whenTestIsCompleted     (event: TestIsCompleted);
    whenTestIsFinished      (event: TestIsFinished);
    whenTestStepIsStarted   (event: TestStepIsStarted);
    whenTestStepIsCompleted (event: TestStepIsCompleted);
    whenTestStepIsFinished  (event: TestStepIsFinished);
}

export class TestLifecycleListenerInterface implements RuntimeInterfaceDescriptor {
    methodNames = [
        'whenTestIsStarted',
        'whenTestIsCompleted',
        'whenTestIsFinished',
        'whenTestStepIsStarted',
        'whenTestStepIsCompleted',
        'whenTestStepIsFinished'
    ];
    className   = 'TestLifecycleListenerInterface';
}