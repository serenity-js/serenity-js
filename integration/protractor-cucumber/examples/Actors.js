const { BrowseTheWeb } = require('@serenity-js/protractor');

module.exports.Actors = class Actors {
    prepare(actor) {
        return actor.whoCan(
            BrowseTheWeb.using(require('protractor').browser),
        );
    }
};
