import { ActivityDetails, CorrelationId } from '../model';
import { TellsTime } from '../screenplay';
import { DomainEvent } from './DomainEvent';

export interface EmitsDomainEvents extends TellsTime {
    currentSceneId(): CorrelationId;
    assignNewActivityId(details: ActivityDetails): CorrelationId;
    announce(event: DomainEvent): void;
    waitForNextCue(): Promise<void>,
}
