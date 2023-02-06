import { DiffFormatter } from './DiffFormatter';

/**
 * A no-op {@apilink DiffFormatter} that produces output identical to input.
 *
 * @group Errors
 */
export class NoOpDiffFormatter implements DiffFormatter {
    expected(line: string): string {
        return line;
    }

    received(line: string): string {
        return line;
    }

    unchanged(line: string): string {
        return line;
    }
}
