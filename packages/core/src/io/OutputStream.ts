/**
 * @desc
 *  An output stream to be injected into {@link StageCrewMemberBuilder}s configured via {@link SerenityConfig#crew}.
 *
 * @interface
 *
 * @see {@link StageCrewMemberBuilder}
 * @see {@link Serenity#configure}
 * @see {@link SerenityConfig#crew}
 */
export interface OutputStream {
    /**
     * @type {function(content: string): void}
     */
    write: (content: string) => void;
}
