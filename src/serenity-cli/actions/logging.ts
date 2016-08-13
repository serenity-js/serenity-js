import { logger } from '../logger';
import { format } from 'util';

export const notify = <T>(template: string, level: string) => (arg: T) => {

    switch (true) {
        case arg instanceof Error:
            logger.log(level, template, [ (<any> arg).message ]);

            return Promise.reject<T>(new Error(format(template, (<any> arg).message)));

        case typeof arg === 'boolean':
            logger.log(level, template);

            break;

        default:
            logger.log(level, template, [ arg ]);
    }

    return Promise.resolve<T>(arg);
};

export const inform   = <T>(template: string) => notify<T>(template, 'info');
export const complain =    (template: string) => notify<Error>(template, 'error');
