import { extend } from 'lodash';
import { Attemptable, FunctionalPerformable } from '../screenplay';
import { Actor } from '../screenplay/actor';
import { Serenity } from '../serenity';
import { StageManager } from '../stage/stage_manager';
import { describeStep } from './step_annotation';
import { StepExecutor } from './step_executor';

export function aTask(...tasks: Attemptable[]): Describable {
    return toDescribable(compose(...tasks));
}

export function compose(...tasks: Attemptable[]): FunctionalPerformable {
    return (actor: Actor) => actor.attemptsTo(...tasks);
}

export function toDescribable(performable: FunctionalPerformable): Describable {
    return extend<Describable>(performable, {
        where: descriptionTemplate => toReportable(describeStep(performable, descriptionTemplate)),
    });
}

export function toReportable(performable: FunctionalPerformable): Reportable {
    const withDefaultStageManager = attachExecutor(performable, Serenity.stageManager());
    return extend<Reportable>(withDefaultStageManager, {
        whichReportsTo: stageManager => attachExecutor(performable, stageManager),
    });
}

export function attachExecutor(performable: Attemptable, stageManager: StageManager): FunctionalPerformable {
    return (actor: Actor) => StepExecutor.for(actor).whichNotifies(stageManager).execute(performable);
}

export interface Describable extends FunctionalPerformable {
    where(descriptionTemplate: string): Reportable;
}

export interface Reportable extends FunctionalPerformable {
    whichReportsTo(stageManager: StageManager): FunctionalPerformable;
}
