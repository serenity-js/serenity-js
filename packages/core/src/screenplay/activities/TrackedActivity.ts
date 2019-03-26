import { InteractionFinished, InteractionStarts, TaskFinished, TaskStarts } from '../../events';
import { ActivityDetails, CorrelationId, ExecutionSuccessful } from '../../model';
import { Clock, StageManager } from '../../stage';
import { Activity } from '../Activity';
import { AnswersQuestions, PerformsTasks, UsesAbilities } from '../actor';
import { Interaction } from '../Interaction';
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
            TrackedActivity.describer.describe(this.activity, actor),
            CorrelationId.create(),
        );

        const [ activityStarts, activityFinished] = this.activity instanceof Interaction
            ? [ InteractionStarts, InteractionFinished ]
            : [ TaskStarts, TaskFinished ];

        return Promise.resolve()
            .then(() => this.stageManager.notifyOf(new activityStarts(details, this.clock.now())))
            .then(() => this.activity.performAs(actor))
            .then(() => {
                const outcome = new ExecutionSuccessful();
                this.stageManager.notifyOf(new activityFinished(details, outcome, this.clock.now()));
            })
            .catch(error => {
                const outcome = TrackedActivity.outcomes.outcomeFor(error);
                this.stageManager.notifyOf(new activityFinished(details, outcome, this.clock.now()));

                throw error;
            });
    }

    toString() {
        return this.activity.toString();
    }
}
