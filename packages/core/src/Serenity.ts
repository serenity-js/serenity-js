import { DomainEvent } from './events';
import { Duration } from './model';
import { Clock, DressingRoom, Stage, StageCrewMember, StageManager } from './stage';

export class Serenity {
    private readonly stageManager: StageManager;

    constructor(clock: Clock = new Clock()) {
        this.stageManager = new StageManager(Duration.ofSeconds(3), clock);
    }

    // todo: make it take config
    setTheStage(...stageCrewMembers: StageCrewMember[]): void {
        this.stageManager.register(...stageCrewMembers);
    }

    callToStageFor(actors: DressingRoom): Stage {
        return new Stage(actors, this.stageManager);
    }

    announce(event: DomainEvent): void {
        this.stageManager.notifyOf(event);
    }

    waitForNextCue(): Promise<void> {
        return this.stageManager.waitForNextCue();
    }

    // todo: add "configure"
}
