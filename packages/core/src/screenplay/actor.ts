import { serenity } from '..';
import { ActivityFinished, ActivityStarts, Outcome, RecordedActivity, Result, SourceLocation } from '../domain';
import { describeAs } from '../recording/activity_description';
import { StageManager } from '../stage/stage_manager';

import { Activity } from './activities';
import { Question } from './question';

import { StackFrame } from 'stacktrace-js';
import StackTrace = require('stacktrace-js');

export interface Ability {} // tslint:disable-line:no-empty-interface
export interface AbilityConstructor<A extends Ability> {
    new (...args): A;
    as(actor: UsesAbilities): A;
}

export interface PerformsTasks {
    attemptsTo(...tasks: Activity[]): Promise<void>;
}

export interface UsesAbilities {
    /**
     * Gives the Actor the Abilities to perform Actions
     *
     * @param abilities
     */
    whoCan(...abilities: Ability[]): UsesAbilities;

    /**
     * Grants access to the Actor's ability
     *
     * @param doSomething   Ability class name
     */
    abilityTo<T extends Ability>(doSomething: AbilityConstructor<T>): T;
}

export interface AnswersQuestions {
    toSee<T>(question: Question<T>): T;
}

export class Actor implements PerformsTasks, UsesAbilities, AnswersQuestions {

    private tracker: ActivityTracker;
    private abilities: { [id: string]: Ability } = {};

    static named(name: string): Actor {
        return new Actor(name, serenity.stageManager());
    }

    whoCan(...abilities: Ability[]): Actor {
        abilities.forEach(ability => {
            this.abilities[ability.constructor.name] = ability;
        });

        return this;
    }

    abilityTo<T extends Ability>(doSomething: AbilityConstructor<T>): T {
        if (! this.can(doSomething)) {
            throw new Error(`I don't have the ability to ${doSomething.name}, said ${this} sadly.`);
        }

        return this.abilities[doSomething.name] as T;
    }

    attemptsTo(...activities: Activity[]): Promise<void> {
        return activities.map(this.tracker.track).reduce((previous: Promise<void>, current: Activity) => {
            return previous.then(() => current.performAs(this));
        }, Promise.resolve(null));
    }

    toSee<T>(question: Question<T>): T {
        return question.answeredBy(this);
    }

    toString(): string {
        return this.name;
    }

    constructor(private name: string, stage_manager: StageManager) {
        this.tracker = new ActivityTracker(stage_manager);
    }

    private can<T extends Ability>(doSomething: AbilityConstructor<T>): boolean {
        return !! this.abilities[doSomething.name];
    }
}

class ActivityTracker {
    track = (activity: Activity) => this.shouldTrack(activity) ? new TrackedActivity(activity, this.stage_manager) :  activity;

    constructor(private stage_manager: StageManager) {
    }

    private shouldTrack = (activity: Activity) => activity.toString() !== '[object Object]';
}

class TrackedActivity implements Activity {

    private location: Promise<SourceLocation>;

    performAs(actor: PerformsTasks | UsesAbilities | AnswersQuestions): PromiseLike<void> {
        const description = describeAs(this.activity.toString(), actor);

        return this.location.then(location => {

            const recorded_activity = new RecordedActivity(description, location);

            return Promise.resolve()
                .then(() => this.beforeStep(recorded_activity))
                .then(() => this.activity.performAs(actor))
                .then(() => this.afterStep(recorded_activity), e => this.onFailure(recorded_activity, e)) as PromiseLike<void>;
        });
    }

    constructor(private activity: Activity, private stage_manager: StageManager) {
        this.location = locateCallerOf('Actor.attemptsTo');
    }

    private beforeStep(activity: RecordedActivity) {
        this.stage_manager.notifyOf(new ActivityStarts(activity));
    }

    private afterStep(activity: RecordedActivity) {
        this.stage_manager.notifyOf(new ActivityFinished(new Outcome(activity, Result.SUCCESS)));
    }

    private onFailure(activity: RecordedActivity, error: Error) {
        this.stage_manager.notifyOf(new ActivityFinished(new Outcome(activity, this.resultFrom(error), error)));

        return Promise.reject(error);
    }

    // todo: extract
    private resultFrom(error: Error): Result {
        const constructorOf = e => e && e.constructor ? e.constructor.name : '';

        // todo: sniff the exception to find out about the Result. Did the test fail, or was it compromised?
        return /AssertionError/.test(constructorOf(error))
            ? Result.FAILURE
            : Result.ERROR;
    }
}

// todo: extract
function locateCallerOf(method: string) {
    const origin_of = (frames: StackFrame[]): number => frames.findIndex(frame => !! frame.functionName && !! ~frame.functionName.indexOf(method));
    const get_frame = (frames: StackFrame[]): StackFrame => frames[origin_of(frames) + 1];
    const frames_of_interest = (frame: StackFrame) => frame && frame.fileName && !~ frame.fileName.indexOf('node_modules');
    const to_location = (frame: StackFrame): SourceLocation => (frame && {
        path:   frame.fileName,
        line:   frame.lineNumber,
        column: frame.columnNumber,
    });

    return StackTrace.get({ filter: frames_of_interest }).then(get_frame).then(to_location);
}
