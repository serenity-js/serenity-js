import { DomainEvent } from '@serenity-js/core/lib/events/index.js';
import { StageCrewMember } from '@serenity-js/core/lib/stage/index.js';

export function givenFollowingEvents(...events: DomainEvent[]) {
    return ({
        areSentTo: (crewMember: StageCrewMember) => {
            events.forEach(event => crewMember.notifyOf(event));
        },
    });
}
