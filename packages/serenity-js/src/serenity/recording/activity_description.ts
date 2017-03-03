import { RecordedActivity, RecordedInteraction, RecordedTask } from '../domain/model';
import { Activity } from '../screenplay/activities';
import { ActivityType } from './activity_type';

// todo: find a better name; it's not really a "description";
export class ActivityDescription {
    private argToken   = /{(\d+)}/g;
    private fieldToken = /#(\w+)/g;

    constructor(private template: string, private type: ActivityType) { }

    interpolateWith(activity: Activity, argumentsOfThePerformAsMethod: any[]): RecordedActivity {
        const name = this.determineName(this.template, activity, argumentsOfThePerformAsMethod);

        return (this.type === ActivityType.Task)
            ? new RecordedTask(name)
            : new RecordedInteraction(name);
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

    private determineName(template: string, activity: Activity, args: any[]): string {
        return template.
            replace(this.fieldToken, this.using(activity)).
            replace(this.argToken, this.using(args));
    }
}
