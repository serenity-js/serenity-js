/**
 * @see https://funkjedi.com/technology/412-every-nth-item-in-handlebars/
 *
 * <div class="container">
 *     {{#inGroupsOf 3 books}}
 *         <div class="row">
 *             {{#each this }}
 *                 <div class="span4 book" data-isbn="{{ isbn }}">
 *                     <strong>{{ name }}</strong>
 *                 </div>
 *             {{/each}}
 *         </div>
 *     {{/inGroupsOf}}
 * </div>
 *
 * @param every
 * @param context
 * @param options
 * @returns {string}
 */
module.exports = function inGroupsOf(every, context, options) {
    var out = "", subcontext = [], i;
    if (context && context.length > 0) {
        for (i = 0; i < context.length; i++) {
            if (i > 0 && i % every === 0) {
                out += options.fn(subcontext);
                subcontext = [];
            }
            subcontext.push(context[i]);
        }
        out += options.fn(subcontext);
    }
    return out;
};
