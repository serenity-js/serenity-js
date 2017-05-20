import { Activity } from '../screenplay';
import { describeAs } from './activity_description';

export class Step {

    describedUsing<T extends Activity>(template: string): StepAnnotation<T> {

        return (target: T, propertyKey: string, descriptor: PerformAsMethodSignature) => {

            if (this.usesOldDescriptionStyle(target)) {
                target.toString = function() {
                    return describeAs(template, this);
                };
            }

            return descriptor;
        };
    }

    private usesOldDescriptionStyle(activity: Activity) {
        return activity.toString() === '[object Object]';
    }
}

export function step<A extends Activity>(stepDescriptionTemplate: string): StepAnnotation<A> {
    return new Step().describedUsing(stepDescriptionTemplate);
}

export type PerformAsMethodSignature = TypedPropertyDescriptor<(PerformsTasks) => PromiseLike<void>>;

export type StepAnnotation<T extends Activity> = (target: T, propertyKey: string, descriptor: PerformAsMethodSignature) => PerformAsMethodSignature;
