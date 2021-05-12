import { InteractionFinished, InteractionStarts, TaskFinished, TaskStarts } from '../../events';
import { ActivityDetails, ExecutionSuccessful } from '../../model';
import { Stage } from '../../stage';
import { Activity } from '../Activity';
import { AnswersQuestions, PerformsActivities, UsesAbilities } from '../actor';
import { Interaction } from '../Interaction';
import { ActivityDescriber } from './ActivityDescriber';
import { OutcomeMatcher } from './OutcomeMatcher';

/** @package */
export class TrackedActivity implements Activity {

    protected static readonly describer = new ActivityDescriber();
    protected static readonly outcomes = new OutcomeMatcher();

    constructor(
        protected readonly activity: Activity,
        protected readonly stage: Stage,
    ) {
    }

    performAs(actor: (PerformsActivities | UsesAbilities | AnswersQuestions) & { name: string }): PromiseLike<void> {
        const
            sceneId = this.stage.currentSceneId(),
            activityId = this.stage.assignNewActivityId(),
            details = new ActivityDetails(TrackedActivity.describer.describe(this.activity, actor));

        const [ activityStarts, activityFinished] = this.activity instanceof Interaction
            ? [ InteractionStarts, InteractionFinished ]
            : [ TaskStarts, TaskFinished ];

        return Promise.resolve()
            .then(() => this.stage.announce(new activityStarts(sceneId, activityId, details, this.stage.currentTime())))
            .then(() => this.activity.performAs(actor))
            .then(() => {
                const outcome = new ExecutionSuccessful();
                this.stage.announce(new activityFinished(sceneId, activityId, details, outcome, this.stage.currentTime()));
            })
            .catch(error => {
                const outcome = TrackedActivity.outcomes.outcomeFor(error);
                this.stage.announce(new activityFinished(sceneId, activityId, details, outcome, this.stage.currentTime()));

                throw error;
            });
    }

    toString(): string {
        return this.activity.toString();
    }
}
