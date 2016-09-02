import { DomainEvent } from './domain/events';
import { Cast, Journal, Stage, StageCrewMember, StageManager } from './stage';

export const Default_Path_To_Reports = `${process.cwd()}/target/site/serenity/`;

export class Serenity {
    private static serenity: Serenity;

    private stage: Stage = new Stage(new StageManager(new Journal()));

    public static callToStageFor(cast: Cast): Stage {
        return Serenity.instance.stage.enter(cast);
    }

    public static stageManager() {
        return Serenity.instance.stage.manager;
    }

    public static notify(event: DomainEvent<any>) {
        Serenity.instance.stage.manager.notifyOf(event);
    }

    public static assignCrewMembers(...crewMembers: StageCrewMember[]) {
        crewMembers.forEach(crewMember => crewMember.assignTo(Serenity.instance.stage));
    }

    private static get instance() {
        return Serenity.serenity || (Serenity.serenity = new Serenity());
    }
}
