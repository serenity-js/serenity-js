const { BrowseTheWebWithProtractor } = require('@serenity-js/protractor');

module.exports.Actors = class Actors {
    prepare(actor) {
        return actor.whoCan(
            BrowseTheWebWithProtractor.using(require('protractor').browser),
        );
    }
};
