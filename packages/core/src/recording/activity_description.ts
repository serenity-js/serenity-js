import { Activity } from '../screenplay/activities';
import { Actor } from '../screenplay/actor';

const isActor = (candidate: any) => candidate instanceof Actor;

const using = (source: any) => (token: string, field: string|number) => typeof source[field] === 'function'
        ? stringify(token, source[field].bind(source))
        : stringify(token, source[field]);

const includeActorName      = (template: string, actor: Actor)       => template.replace('#actor',   actor.toString());
const interpolateArguments  = (template: string, parameters: any[])  => template.replace(/{(\d+)}/g, using(parameters));
const interpolateFields     = (template: string, activity: Activity) => template.replace(/#(\w+)/g,  using(activity));

export function describeAs(template: string, ...parameters: any[]): string {
    const first: any = parameters[0];

    switch (true) {
        case parameters.length > 1 || typeof first !== 'object':
            return interpolateArguments(template, parameters);

        case isActor(first):
            return includeActorName(interpolateArguments(template, parameters), first);

        default:
            return interpolateFields(template, first);
    }
}

function stringify(token: string, value: any): string {
    switch ({}.toString.call(value)) {
        case '[object Function]':   return stringify(token, value());
        case '[object Array]':      return value.map(item => stringify(token, item)).join(', ');
        case '[object Object]':     return value.toString();
        case '[object Undefined]':  return token;
        default:                    return value;
    }
}
