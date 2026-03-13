/* eslint-disable @typescript-eslint/explicit-module-boundary-types, unicorn/prevent-abbreviations
 */

// https://github.com/koajs/koa

import Koa from 'koa';

export default {
    node: '>= 6.9',
    description: 'Koa app',
    handler: () => new Koa().use(ctx => Promise.resolve(ctx.body = 'Hello World!')).callback(),
};
