import { Name } from '../../model';
import { Activity } from '../Activity';

/** @package */
export class ActivityDescriber {

    describe(activity: Activity, actor: { name: string }): Name {
        const template = activity.toString() !== ({}).toString()
            ? activity.toString()
            : `#actor performs ${ activity.constructor.name }`;

        return new Name(
            this.includeActorName(template, actor),
        );
    }

    private includeActorName(template: string, actor: { name: string }) {
        return template.replace('#actor', actor.name);
    }
}
