import {Activity} from '../domain/model';
import {Performable} from '../screenplay/performables';

export class StepDescription {
    private argToken   = /{(\d+)}/g;
    private fieldToken = /#(\w+)/g;

    public static from(template: string) {
        return new StepDescription(template);
    }

    constructor(private template: string) { }

    interpolateWith(performable: Performable, argumentsOfThePerformAsMethod: any[]): Activity {
        let name = this.determineStepName(this.template, performable, argumentsOfThePerformAsMethod);

        return new Activity(name);
    }

    private using(source: any) {
        return (token: string, field: string|number) => {
            switch ({}.toString.call(source[field])) {
                case '[object Function]':   return source[field]();
                case '[object Array]':      return source[field].join(', ');
                case '[object Object]':     return source[field].toString();
                case '[object Undefined]':  return token;
                default:                    return source[field];
            }
        };
    }

    private determineStepName(template: string, performable: Performable, args: any[]): string {
        return template.
            replace(this.fieldToken, this.using(performable)).
            replace(this.argToken, this.using(args));
    }
}
