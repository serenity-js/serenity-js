import { StageCrewMember } from '@serenity-js/core';
import { DomainEvent } from '@serenity-js/core/lib/events';

export function given(crewMember: StageCrewMember) {    // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    return ({
        isNotifiedOfFollowingEvents: (...events: DomainEvent[]) => {
            events.forEach(event => crewMember.notifyOf(event));
        },
    });
}
