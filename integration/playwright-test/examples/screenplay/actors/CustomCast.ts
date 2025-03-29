import { Cast, Notepad, TakeNotes } from '@serenity-js/core';

export function CustomCast({ extraContextOptions, options }) {
    return Cast.where(actor => actor.whoCan(
        TakeNotes.using(Notepad.with({
            extraContextOptions,
            options,
        }))),
    );
}
