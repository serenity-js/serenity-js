import { DomainEvent } from './domain/events';
import { Cast, Journal, Stage, StageCrewMember, StageManager } from './stage';

export const Default_Path_To_Reports = `${process.cwd()}/target/site/serenity/`;

export class Serenity {
    private stage: Stage = new Stage(new StageManager(new Journal()));

    callToStageFor = (cast: Cast): Stage => this.stage.enter(cast);

    notify(event: DomainEvent<any>) {
        this.stage.manager.notifyOf(event);
    }

    stageManager = () => this.stage.manager;

    assignCrewMembers(...crewMembers: StageCrewMember[]) {
        crewMembers.forEach(crewMember => crewMember.assignTo(this.stage));
    }
}
