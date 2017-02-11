import { Runner } from 'protractor';
import { DomainEvent, SceneFinished } from '../../serenity/domain';
import { Stage, StageCrewMember } from '../../serenity/stage';

export class ProtractorNotifier implements StageCrewMember {

    private static Events_of_Interest = [ SceneFinished ];
    private stage: Stage;

    constructor(private runner: Runner) {
    }

    assignTo(stage: Stage) {
        this.stage = stage;
        this.stage.manager.registerInterestIn(ProtractorNotifier.Events_of_Interest, this);
    }

    notifyOf(event: DomainEvent<any>): void {
        switch (event.constructor.name) { // tslint:disable-line:switch-default - other events will not be sent by design
            case SceneFinished.name:    return this.sceneFinished(event);
        }
    }

    private sceneFinished(event: SceneFinished): void {
        if (this.runner.afterEach) {
            this.stage.manager.informOfWorkInProgress(this.runner.afterEach());
        }
    }
}
