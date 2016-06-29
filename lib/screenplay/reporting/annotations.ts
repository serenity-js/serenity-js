import {Performable} from "../pattern/performables";
import {Serenity} from "../../serenity/serenity";
import {Result} from "../../serenity/domain";

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

            Serenity.instance.stepStarts(interpolated);

            try {
                step.apply(this, args);

                Serenity.instance.stepCompleted(interpolated, Result.SUCCESS);
            }
            catch(e) {
                // todo: sniff the exception to find out the Result
                Serenity.instance.stepCompleted(interpolated, Result.FAILURE, e);

                // notify the test runner about the problem as well
                throw e;
            }
        };

        return descriptor;
    };
}