import { Name } from '../../model';
import { Activity } from '../Activity';

export class ActivityDescriber {

    // todo: if the name can't be determined, make one up
    describe(activity: Activity, actor: { toString: () => string }): Name {
        const template = activity.toString();

        return new Name(
            this.includeActorName(template, actor),
        );
    }

    private includeActorName(template: string, actor: { toString: () => string }) {
        return template.replace('#actor',   actor.toString());
    }
}
