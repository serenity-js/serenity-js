import { DomainEvent } from '../../../src/events';
import { StageCrewMember } from '../../../src/stage';

export function given(crewMember: StageCrewMember) {
    return ({
        isNotifiedOfFollowingEvents: (...events: DomainEvent[]) => {
            events.forEach(event => crewMember.notifyOf(event));
        },
    });
}
