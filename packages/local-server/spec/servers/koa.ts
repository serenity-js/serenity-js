// https://github.com/koajs/koa
import * as Koa from 'koa';

export = {
    node: '>= 6.9',
    description: 'Koa app',
    handler: () => new Koa().use(ctx => Promise.resolve(ctx.body = 'Hello World!')).callback(),
};
