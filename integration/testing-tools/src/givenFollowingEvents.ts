import { DomainEvent } from '@serenity-js/core/lib/events';
import { StageCrewMember } from '@serenity-js/core/lib/stage';

export function givenFollowingEvents(...events: DomainEvent[]) {
    return ({
        areSentTo: (crewMember: StageCrewMember) => {
            events.forEach(event => crewMember.notifyOf(event));
        },
    });
}
