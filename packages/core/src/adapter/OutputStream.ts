/**
 * An output stream to be injected into {@apilink StageCrewMemberBuilder|StageCrewMemberBuilders} configured via {@apilink SerenityConfig.crew}.
 *
 * ## Learn more
 * - {@apilink StageCrewMemberBuilder}
 * - {@apilink Serenity.configure}
 * - {@apilink SerenityConfig.crew}
 *
 * @group Integration
 */
export interface OutputStream {
    write(content: string): void;
}
