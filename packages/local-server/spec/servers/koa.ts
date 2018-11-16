// https://github.com/koajs/koa
import * as Koa from 'koa';

export = {
    description: 'Koa app',
    handler: new Koa().use(ctx => Promise.resolve(ctx.body = 'Hello World!')).callback(),
};
