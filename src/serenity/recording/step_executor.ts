import { Actor, Attemptable, isPerformable } from '../screenplay';
import { StageManager } from '../stage';
import { getDescription, isDescribed } from './step_annotation';
import { StepDescription } from './step_description';
import { StepNotifier } from './step_notifier';

export class StepExecutor {

    private notifier?: StepNotifier;

    static for(actor: Actor) {
        return new StepExecutor(actor);
    }

    whichNotifies(stageManager: StageManager) {
        this.notifier = new StepNotifier(stageManager);

        return this;
    }

    execute(attemptable: Attemptable): PromiseLike<void> {
        if (this.notifier && isDescribed(attemptable)) {
            return this.executeDescribed(attemptable);
        }
        return this.bindAttemptable(attemptable)();
    }

    private constructor(private actor: Actor) {}

    private executeDescribed(attemptable: Attemptable): PromiseLike<void> {
        const annotation = getDescription(attemptable);
        const description = new StepDescription(annotation);
        const activity = this.getActivity(attemptable, description);
        return this.notifier.executeStep(activity, this.bindAttemptable(attemptable));
    }

    private bindAttemptable(attemptable: Attemptable) {
        if (isPerformable(attemptable)) {
            return attemptable.performAs.bind(attemptable, this.actor);
        }
        return attemptable.bind(null, this.actor);
    }

    private getActivity(attemptable: Attemptable, description) {
        if (isPerformable(attemptable)) {
            return description.interpolateWith(attemptable, [this.actor]);
        }
        return description.interpolateWith(null, [this.actor]);
    }
}
