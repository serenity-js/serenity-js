import _ = require('lodash');

export class Config<T> {
    constructor(private config: T) {
    }

    get get(): T {
        return _.cloneDeep(this.config);
    }

    mergedWith(otherConfig: T): Config<T> {
        return new Config(_.mergeWith({}, this.config, otherConfig, this.mergeValuesAndConcatenateLists));
    }

    withFallback(defaults: T): Config<T> {
        return new Config(_.mergeWith({}, defaults, this.config, this.mergeValuesButOverrideLists));
    }

    private mergeValuesAndConcatenateLists = (objValue, srcValue) => {
        if (_.isArray(objValue)) {
            return objValue.concat(srcValue);
        }
    }

    private mergeValuesButOverrideLists = (objValue, srcValue) => {
        if (_.isArray(objValue)) {
            return srcValue;
        }
    }
}
