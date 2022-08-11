/**
 * An output stream to be injected into {@link StageCrewMemberBuilder|StageCrewMemberBuilders} configured via {@apilink SerenityConfig.crew}.
 *
 * ## Learn more
 * - {@link StageCrewMemberBuilder}
 * - {@apilink Serenity.configure}
 * - {@apilink SerenityConfig.crew}
 *
 * @group Integration
 */
export interface OutputStream {
    write(content: string): void;
}
