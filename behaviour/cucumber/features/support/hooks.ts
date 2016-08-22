import { scenarioLifeCycleNotifier } from '../../../../src/serenity-cucumber/adapters/cucumber_serenity_notifier';
import { DomainEvent } from '../../../../src/serenity/domain/events';
import { Serenity } from '../../../../src/serenity/serenity';

class ChildProcessReporter {
    assignTo(stage) {
        stage.manager.registerInterestIn([ DomainEvent ], this);
    }

    notifyOf(event) {
        process.send(event);
    }
}

export = function () {

    Serenity.assignCrewMembers(new ChildProcessReporter());

    this.registerListener(scenarioLifeCycleNotifier());
};
