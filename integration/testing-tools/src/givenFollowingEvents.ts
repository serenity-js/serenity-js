import { DomainEvent } from '@serenity-js/core/events';
import { StageCrewMember } from '@serenity-js/core/stage';

export function givenFollowingEvents(...events: DomainEvent[]) {
    return ({
        areSentTo: (crewMember: StageCrewMember) => {
            events.forEach(event => crewMember.notifyOf(event));
        },
    });
}
