import { Cast, Notepad, TakeNotes } from '@serenity-js/core';

export function CustomCast({ contextOptions, options }) {
    return Cast.whereEveryoneCan(
        TakeNotes.using(Notepad.with({
            contextOptions,
            options,
        })),
    );
}
