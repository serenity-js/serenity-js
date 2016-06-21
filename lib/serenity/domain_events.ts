// ----------------------------------------------------------------------------
// interface checkers

interface InterfaceDescription {
    methodNames?: string[];
    propertyNames?: string[];
    className: string;
}

// todo: rename and cleanup
class InterfaceChecker {
    static implements<T extends InterfaceDescription>(objectToCheck: Object, t: { new (): T; }): boolean {
        var targetInterfaceDescription = new t();

        (targetInterfaceDescription.methodNames || []).forEach((method) => {
            if (!objectToCheck[method] || typeof objectToCheck[method] !== 'function') {
                console.error(`Method: '${method}' not found on ${JSON.stringify(objectToCheck)}`);
                return false;
            }
        });

        (targetInterfaceDescription.propertyNames || []).forEach((property) => {
            if (!objectToCheck[property] || typeof objectToCheck[property] == 'function') {
                console.error(`Property: '${property}' not found on ${JSON.stringify(objectToCheck)}`);
                return false;
            }
        });

        return true;
    }
}

// ----------------------------------------------------------------------------
// events

interface DomainEvent<T> {
    value(): T
}

export class TestStarted implements DomainEvent<string> {
    value():string {
        return "test started";
    }
    
    static get interface(): {new (): InterfaceDescription} {
        return TestStartedInterface;
    }
}

export class TestStartedInterface implements InterfaceDescription {
    methodNames:string[] = ['value'];
    className:string       = 'TestStartedInterface';
}

class TestFinished implements DomainEvent<string> {
    value():string {
        return "test finished";
    }
}

class TestStepStarted implements DomainEvent<string> {
    value():string {
        return "test step started";
    }
}

class TestStepFinished implements DomainEvent<string> {
    value():string {
        return "test step finished";
    }
}

// ----------------------------------------------------------------------------
// event handlers

interface DomainEventHandler<T extends DomainEvent<any>> {
    handle(event: T);
}

export interface TestStartedHandler extends DomainEventHandler<TestStarted> { }

export class TestStartedHandlerInterface implements InterfaceDescription {
    methodNames = ['handle'];
    className   = 'TestStartedHandlerInterface';
}


export class RegistersTestStarted implements TestStartedHandler {
    handle(event:TestStarted) {
        console.log("[DOMAIN EVENT TRIGGERED] ", event.value())
    }

    static get interface(): {new (): InterfaceDescription}  {
        return TestStartedHandlerInterface;
    }
}

// ----------------------------------------------------------------------------
// event bus

class EventHandlers<DE extends DomainEvent<any>> {
    private eventHandlers: DomainEventHandler<DE>[] = [];

    register(handler: DomainEventHandler<DE>, interfaceType: {new (): InterfaceDescription}) {

        if(InterfaceChecker.implements(handler, interfaceType)) {
            this.eventHandlers.push(handler);
        } else {
            throw new Error(`EventHandlers can'r register a '${new interfaceType().className}' handler`);
        }
    }

    trigger(event: DE){
        this.eventHandlers.forEach((handler) => {
            handler.handle(event);
        });
    }
}

export class DomainEvents<DE extends DomainEvent<any>> {
    private handlers: EventHandlers<DE>[] = new Array<EventHandlers<DE>>();

    public register(handler: DomainEventHandler<DE>,
                    handlerInterface: { new(): InterfaceDescription },
                    eventInterface: { new(): InterfaceDescription })
    {
        let eventType   = new eventInterface();

        let existingHandlers = this.handlers[eventType.className];

        if (existingHandlers) {
            existingHandlers.register(handler, handlerInterface);
        } else {
            let newHandlers = new EventHandlers<DE>();
            newHandlers.register(handler, handlerInterface);

            this.handlers[eventType.className] = newHandlers;
        }
    }

    public trigger(event: DE, eventInterface: { new(): InterfaceDescription }) {
        if (InterfaceChecker.implements(event, eventInterface)) {
            let eventType = new eventInterface(),
                handlers  = this.handlers[eventType.className];
            
            if (handlers) {
                handlers.trigger(event);
            }
            else {
                console.error("didn't find an appropriate handler");
            }
        }
    }
}


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