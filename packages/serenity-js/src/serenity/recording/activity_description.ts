import { Actor } from '../screenplay/actor';

export function describe_as(template: string, ...parameters: any[]): string {

    const
        argument_tokens = /{(\d+)}/g,
        field_tokens    = /#(\w+)/g,
        actor_token     = '#actor',
        actor_name      = parameters[0] instanceof Actor ? parameters[0] : actor_token;

    const interpolated = field_tokens.test(template)
        ? template.replace(field_tokens, using(parameters[0]))
        : template.replace(argument_tokens, using(parameters));

    return interpolated.replace(actor_token, actor_name);
}

function using(source: any) {
    return (token: string, field: string|number) => stringify(token, source[field]);
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
