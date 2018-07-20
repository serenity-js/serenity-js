import { DomainEvent } from '../domain';
import { StageManager } from './StageManager';

export interface StageCrewMember {
    assignTo(stageManager: StageManager): void;
    notifyOf(event: DomainEvent): void;
}
