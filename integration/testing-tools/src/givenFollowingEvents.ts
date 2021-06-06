import { DomainEvent } from '@serenity-js/core/lib/events';
import { StageCrewMember } from '@serenity-js/core/lib/stage';

export function givenFollowingEvents(...events: DomainEvent[]): {areSentTo: (crewMember: any) => void} {
    return ({
        areSentTo: (crewMember: StageCrewMember): void => {
            events.forEach(event => crewMember.notifyOf(event));
        },
    });
}
