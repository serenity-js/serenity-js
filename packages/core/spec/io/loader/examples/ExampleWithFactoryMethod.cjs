"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleWithFactoryMethod = void 0;

class ExampleWithFactoryMethod {
    static fromJSON(config) {
        return new ExampleWithFactoryMethod(config.name);
    }

    constructor(name) {
        this.name = name;
    }
}
exports.ExampleWithFactoryMethod = ExampleWithFactoryMethod;
