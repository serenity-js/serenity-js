import { cloneDeep } from 'lodash';
import { Performable } from '../screenplay/performables';
import { Serenity } from '../serenity';

import { describeStep, getDescription } from './step_annotation';
import { StepDescription } from './step_description';
import { addNotifier, getNotifier, StepNotifier } from './step_notifier';

// todo: add Significance to the @step
export const step = createStepDecorator(Serenity.stageManager());

export function createStepDecorator(stageManager) {

    return <T extends Performable>(stepDescriptionTemplate: string): StepAnnotation<T> =>

        (target: T, propertyKey: string, descriptor: PerformAsMethodSignature) => {
            const performAs = descriptor.value;
            const decorator = cloneDeep(descriptor);
            describeStep(target, stepDescriptionTemplate);
            addNotifier(target, new StepNotifier(stageManager));

            decorator.value = function (...args) {
                const annotation = getDescription(this);
                const description = new StepDescription(annotation);
                const activity = description.interpolateWith(this, args);
                return getNotifier(target).executeStep(activity, performAs.bind(this, ...args));
            };
            return decorator;
        };
}

export type PerformAsMethodSignature = TypedPropertyDescriptor<(PerformsTasks) => PromiseLike<void>>;

export interface StepAnnotation<T extends Performable> {
    (target: T, propertyKey: string, descriptor: PerformAsMethodSignature): PerformAsMethodSignature;
}
