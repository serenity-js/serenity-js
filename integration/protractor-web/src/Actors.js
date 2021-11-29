const { TakeNotes } = require('@serenity-js/core');
const { BrowseTheWebWithProtractor } = require('@serenity-js/protractor');

exports.Actors = class Actors {
    prepare(actor) {
        if (actor.name === `Adam who can't browse the web`) {
            return actor;
        }

        return actor.whoCan(
            BrowseTheWebWithProtractor.using(require('protractor').browser),
            TakeNotes.usingAnEmptyNotepad(),
        );
    }
}
