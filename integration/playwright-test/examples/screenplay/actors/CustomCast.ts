import { Cast, Notepad, TakeNotes } from '@serenity-js/core';

export function CustomCast({ contextOptions, options }) {
    return Cast.where(actor => actor.whoCan(
        TakeNotes.using(Notepad.with({
            contextOptions,
            options,
        }))),
    );
}
