/* tslint:disable */
declare namespace Chai {

    interface TypeComparison {

        /**
         * true if the path leads to a file.
         */
        file: Assertion;

        /**
         * true if the path exists
         */
        path: Assertion;
    }
}

declare module "chai-fs" {
    function chaiFS(chai: any, utils: any): void;
    namespace chaiFS { }
    export = chaiFS;
}
/* tslint:enable */
