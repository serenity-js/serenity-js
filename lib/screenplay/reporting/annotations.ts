import {Performable} from "../pattern/performables";

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

            // todo: send "step started event"
            // console.log('[PERFORMING STEP] ', interpolated);

            step.apply(this, args);

            // todo: send "step finished event"
            // console.log('[  FINISHED STEP] ', interpolated);
        };

        return descriptor;
    };
}