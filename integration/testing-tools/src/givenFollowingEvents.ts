import { DomainEvent } from '@serenity-js/core/lib/events';
import { StageCrewMember } from '@serenity-js/core/lib/stage';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function givenFollowingEvents(...events: DomainEvent[]) {
    return ({
        areSentTo: (crewMember: StageCrewMember) => {
            events.forEach(event => crewMember.notifyOf(event));
        },
    });
}
