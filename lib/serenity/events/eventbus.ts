// todo: DELETE


import {RuntimeInterfaceDescriptor, InterfaceChecker} from "../typesafety";
import * as moment from 'moment';

export class DomainEvent<T> {
    protected _value: T;
    protected _timestamp: number;

    constructor(value: T, timestampInMilliseconds?: number) {
        this._value     = value;
        this._timestamp = timestampInMilliseconds || moment().valueOf(); // time in milliseconds
    }

    value():T {
        return this._value;
    }

    timestamp():number {
        return this._timestamp;
    }
}

export interface DomainEventHandler {

}

class EventHandlers<DE extends DomainEvent<any>> {
    private eventHandlers: DomainEventHandler[] = [];

    register(handler: DomainEventHandler, interfaceType: {new (): RuntimeInterfaceDescriptor}) {

        if(InterfaceChecker.implements(handler, interfaceType)) {
            this.eventHandlers.push(handler);
        } else {
            throw new Error(`EventHandlers can'r register a '${new interfaceType().className}' handler`);
        }
    }

    trigger(event: DE){
        this.eventHandlers.forEach((handler) => {
            let method = `when${event.constructor.name}`;

            if (! handler[method]) {
                throw new Error(`${handler.constructor.name} needs a '${method}' method to handle the '${event.constructor.name}' event.`)
            }

            handler[method](event);
        });
    }
}

export class DomainEvents<DE extends DomainEvent<any>> {
    private handlers: EventHandlers<DE>[] = new Array<EventHandlers<DE>>();

    public register(handler: DomainEventHandler,
                    handlerInterface: { new(): RuntimeInterfaceDescriptor },
                    eventInterface: { new(): RuntimeInterfaceDescriptor })
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

    public trigger(event: DE, eventInterface: { new(): RuntimeInterfaceDescriptor }) {
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