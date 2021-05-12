import { DomainEvent } from '../../../src/events';
import { StageCrewMember } from '../../../src/stage';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function given(crewMember: StageCrewMember) {
    return ({
        isNotifiedOfFollowingEvents: (...events: DomainEvent[]) => {
            events.forEach(event => crewMember.notifyOf(event));
        },
    });
}
