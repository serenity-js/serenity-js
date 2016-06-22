import {Performable} from "../pattern/performables";
import {Serenity} from "../../serenity/serenity";
import {TestStepIsStarted, TestStepIsCompleted} from "../../serenity/events/test_lifecycle";
import {Step, StepOutcome, Result} from "../../serenity/domain";

export function step<STEP extends Performable>(stepDescriptionTemplate: string) {

    function using(source: any) {
        return (token: string, field: string|number) => {
            switch({}.toString.call(source[field])) {
                case '[object Function]': return source[field]();
                case '[object Array]':    return source[field].join(', ');
                case '[object Object]':   return source[field].toString();
                default:                  return source[field];
            }
        }
    }

    function interpolateStepDescription(currentPerformable: Performable, performAsMethodArguments: any[]) {
        const argToken = /{(\d+)}/g,
            fieldToken = /#(\w+)/g;

        return stepDescriptionTemplate.
            replace(fieldToken, using(currentPerformable)).
            replace(argToken, using(performAsMethodArguments))
    }

    return (target: STEP, propertyKey: string, descriptor: TypedPropertyDescriptor<(any) => void>) => {

        let step = descriptor.value;

        descriptor.value = function(...args: any[]): void {

            let interpolated = interpolateStepDescription(this, args);

            // todo: clean up, too much code here
            Serenity.instance.domainEvents().trigger(new TestStepIsStarted(new Step(
                interpolated
            )), TestStepIsStarted.interface);

            try {
                step.apply(this, args);

                Serenity.instance.domainEvents().trigger(new TestStepIsCompleted(new StepOutcome(
                    new Step(interpolated),
                    Result.SUCCESS
                )), TestStepIsStarted.interface);
            }
            catch(e) {
                Serenity.instance.domainEvents().trigger(new TestStepIsCompleted(new StepOutcome(
                    new Step(interpolated),
                    Result.FAILURE
                )), TestStepIsStarted.interface);

            }
        };

        return descriptor;
    };
}