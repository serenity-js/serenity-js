import { Activity, ActivityFinished, ActivityStarts, Outcome, Result } from '../domain';
import { StageManager } from '../stage';

export class StepNotifier {
    constructor(private stageManager: StageManager) {
    }

    executeStep(activity: Activity, step) {
        return Promise.resolve()
            .then(() => this.beforeStep(activity))
            .then(() => step())
            .then(() => this.afterStep(activity), e => this.onFailure(activity, e));
    }

    private beforeStep(activity: Activity) {
        this.stageManager.notifyOf(new ActivityStarts(activity));
    }

    private afterStep(activity: Activity) {
        this.stageManager.notifyOf(new ActivityFinished(new Outcome(activity, Result.SUCCESS)));
    }

    private onFailure(activity: Activity, error: Error) {
        this.stageManager.notifyOf(new ActivityFinished(new Outcome(activity, this.resultFrom(error), error)));

        return Promise.reject(error);
    }

    private resultFrom(error: Error): Result {
        const constructorOf = e => e && e.constructor ? e.constructor.name : '';

        // todo: sniff the exception to find out about the Result. Did the test fail, or was it compromised?
        return /AssertionError/.test(constructorOf(error))
            ? Result.FAILURE
            : Result.ERROR;
    }
}
