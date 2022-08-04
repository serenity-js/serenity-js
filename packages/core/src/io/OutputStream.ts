/**
 * An output stream to be injected into {@link StageCrewMemberBuilder|StageCrewMemberBuilders} configured via [[SerenityConfig.crew]].
 *
 * ## Learn more
 * - {@link StageCrewMemberBuilder}
 * - [[Serenity#configure]]
 * - [[SerenityConfig#crew]]
 */
export interface OutputStream {
    write(content: string): void;
}
