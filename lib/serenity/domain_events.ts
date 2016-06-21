import {InterfaceDescriptor, InterfaceChecker} from "./typesafety";

export interface DomainEvent<T> {
    value(): T;
}

export interface DomainEventHandler {

}

class EventHandlers<DE extends DomainEvent<any>> {
    private eventHandlers: DomainEventHandler[] = [];

    register(handler: DomainEventHandler, interfaceType: {new (): InterfaceDescriptor}) {

        if(InterfaceChecker.implements(handler, interfaceType)) {
            this.eventHandlers.push(handler);
        } else {
            throw new Error(`EventHandlers can'r register a '${new interfaceType().className}' handler`);
        }
    }

    trigger(event: DE){
        this.eventHandlers.forEach((handler) => {
            // todo: we assume that onEventName method exists. Is it too much of an assumption?
            handler[`on${event.constructor.name}`](event);
        });
    }
}

export class DomainEvents<DE extends DomainEvent<any>> {
    private handlers: EventHandlers<DE>[] = new Array<EventHandlers<DE>>();

    public register(handler: DomainEventHandler,
                    handlerInterface: { new(): InterfaceDescriptor },
                    eventInterface: { new(): InterfaceDescriptor })
    {
        let eventType   = new eventInterface();

        let existingHandlers = this.handlers[eventType.className];

        if (existingHandlers) {
            existingHandlers.register(handler, handlerInterface);
        }
        else {
            let newHandlers = new EventHandlers<DE>();
            newHandlers.register(handler, handlerInterface);

            this.handlers[eventType.className] = newHandlers;
        }
    }

    public trigger(event: DE, eventInterface: { new(): InterfaceDescriptor }) {
        if (InterfaceChecker.implements(event, eventInterface)) {
            let eventType = new eventInterface(),
                handlers  = this.handlers[eventType.className];
            
            if (! handlers) {
                throw new Error(`[ERROR] Couldn't find an appropriate handler for a '${event.constructor.name}' event`);

            }

            handlers.trigger(event);
        }
    }
}