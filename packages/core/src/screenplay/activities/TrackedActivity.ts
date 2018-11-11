import { ActivityFinished, ActivityStarts } from '../../events';
import { ActivityDetails, ExecutionSuccessful } from '../../model';
import { Clock, StageManager } from '../../stage';
import { Activity } from '../Activity';
import { AnswersQuestions, PerformsTasks, UsesAbilities } from '../actor';
import { ActivityDescriber } from './ActivityDescriber';
import { OutcomeMatcher } from './OutcomeMatcher';

/** @access package */
export class TrackedActivity implements Activity {

    protected static readonly describer = new ActivityDescriber();
    protected static readonly outcomes = new OutcomeMatcher();

    constructor(
        protected readonly activity: Activity,
        protected readonly stageManager: StageManager,
        protected readonly clock: Clock,
    ) {
    }

    performAs(actor: (PerformsTasks | UsesAbilities | AnswersQuestions) & { name: string }): PromiseLike<void> {
        const details = new ActivityDetails(
            // todo: I might want an id here to make sure the events match up
            TrackedActivity.describer.describe(this.activity, actor),
        );

        return Promise.resolve()
            .then(() => this.stageManager.notifyOf(new ActivityStarts(details, this.clock.now())))
            .then(() => this.activity.performAs(actor))
            .then(() => {
                const outcome = new ExecutionSuccessful();
                this.stageManager.notifyOf(new ActivityFinished(details, outcome, this.clock.now()));
            })
            .catch(error => {
                const outcome = TrackedActivity.outcomes.outcomeFor(error);
                this.stageManager.notifyOf(new ActivityFinished(details, outcome, this.clock.now()));

                throw error;
            });
    }

    toString() {
        return this.activity.toString();
    }
}
