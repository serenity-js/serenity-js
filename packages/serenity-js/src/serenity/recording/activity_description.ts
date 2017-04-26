import { RecordedActivity } from '../domain/model';
import { Activity } from '../screenplay/activities';

// todo: make this a function akin to string.format... describeAs('... #field', obj)
export class ActivityDescription {
    private arg_token   = /{(\d+)}/g;
    private field_token = /#(\w+)/g;

    constructor(private template: string) { }

    // todo: remove
    interpolateWith(activity: Activity, argumentsOfThePerformAsMethod: any[]): RecordedActivity {
        const name = this.determineName(this.template, activity, argumentsOfThePerformAsMethod);

        return new RecordedActivity(name);
    }

    interpolatedWithArguments = (...args: Object[]) => this.template.replace(this.arg_token, this.using(args));

    interpolatedWithFieldsOf = (source: Object) => this.template.replace(this.field_token, this.using(source));

    toString = () => this.template;

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

    // todo: remove
    private determineName(template: string, activity: Activity, args: any[]): string {
        return template.
            replace(this.field_token, this.using(activity)).
            replace(this.arg_token, this.using(args));
    }
}
