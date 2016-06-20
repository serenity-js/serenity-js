import {Performable} from "../pattern/performables";
import {PerformsTasks} from "../pattern/actor";
import {Enter} from "../../screenplay_protractor/actions/enter";

export function step(stepDescription: string) {
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

    function interpolate(currentPerformable: any, performAsMethodArguments: any[]) {
        const argToken = /{(\d+)}/g,
            fieldToken = /#(\w+)/g;

        return stepDescription.
            replace(fieldToken, using(currentPerformable)).
            replace(argToken, using(performAsMethodArguments))
    }

    return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(actor: PerformsTasks) => void>) => {
        let step = descriptor.value;

        descriptor.value = function(...args: any[]): void {

            // let interpolated = stepDescription.replace(fieldToken, using(this)).replace(argToken, using(args));
            let interpolated = interpolate(this, args);

            console.log('[PERFORMING STEP] ', interpolated);

            step.apply(this, args);

            console.log('[  FINISHED STEP] ', interpolated);
        };

        return descriptor;
    };
}