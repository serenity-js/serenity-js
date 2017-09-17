// import { lastOf } from '@serenity-js/integration-testing'; // todo: upgrade TS to support this
import { DomainEvent } from '@serenity-js/core/lib/domain';

export const lastOf = (type: typeof DomainEvent, events: Array<DomainEvent<any>>) => events.filter(e => e instanceof type).pop();
