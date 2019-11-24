import { Chalk } from 'chalk';
import { ThemeForColourTerminals } from './ThemeForColourTerminals';

export class ThemeForLightTerminals extends ThemeForColourTerminals {
    constructor(chalk: Chalk) {
        super(chalk);
    }

    heading(...parts: any[]): string {
        return this.chalk.bold.black(this.joined(parts));
    }

    separator(pattern: string): string {
        return this.repeat(pattern);
    }

    log(...parts): string {
        return this.joined(parts);
    }
}
