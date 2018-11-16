import { satisfies } from 'semver'; // tslint:disable-line:no-implicit-dependencies

function node(requiredVersion: string) {
    return satisfies(process.versions.node, requiredVersion);
}

// tslint:disable:no-var-requires
export = [
    require('./barebones'),
    require('./express'),
    node('>= 8.12') && require('./hapi'),
    require('./koa'),
    require('./restify'),
].filter(_ => !! _);
