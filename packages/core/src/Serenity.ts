import { DomainEvent } from './events';
import { Duration, Timestamp } from './model';
import { Clock, DressingRoom, Stage, StageCrewMember, StageManager } from './stage';
import { Extras } from './stage/Extras';

export class Serenity {
    private readonly stage: Stage;

    constructor(clock: Clock = new Clock()) {
        this.stage = new Stage(
            new Extras(),
            new StageManager(Duration.ofSeconds(2), clock),     // todo: cue timeout should be configurable
        );
    }

    /**
     * @todo make the method receive a config object with cue timeout, stage crew members, test adapter etc.
     * @experimental
     * @param stageCrewMembers
     */
    setTheStage(...stageCrewMembers: StageCrewMember[]): void {
        this.stage.assign(...stageCrewMembers);
    }

    callToStageFor(actors: DressingRoom): Stage {
        return this.stage.callFor(actors);
    }

    announce(event: DomainEvent): void {
        this.stage.announce(event);
    }

    currentTime(): Timestamp {
        return this.stage.currentTime();
    }

    waitForNextCue(): Promise<void> {
        return this.stage.waitForNextCue();
    }
}
