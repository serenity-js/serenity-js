import winston = require('winston');

const logger: winston.LoggerInstance = new (winston.Logger)({
    transports: [],
});

export { logger };

export function adjustLogging(beVerbose: boolean): Promise<void> {

    let level = beVerbose ? 'debug' : 'info';

    winston.level = level;

    forEachOf(logger.transports, overwrite('level', level));

    return Promise.resolve(undefined);
}

function forEachOf(o: any, transform: (property: any) => void) {
    Object.keys(o).forEach(key => o[key] = transform(o[key]));
}

const overwrite = (field: string, value: any) => (target) => {
    target[field] = value;
    return target;
};
