// https://github.com/koajs/koa
const Koa = require('koa'); // tslint:disable-line:no-var-requires  @types/koa cause "Type 'Middleware' is not generic" error

export = {
    node: '>= 6.9',
    description: 'Koa app',
    handler: () => new Koa().use(ctx => Promise.resolve(ctx.body = 'Hello World!')).callback(),
};
