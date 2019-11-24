import { Chalk } from 'chalk';
import { ThemeForColourTerminals } from './ThemeForColourTerminals';

export class ThemeForDarkTerminals extends ThemeForColourTerminals {
    constructor(chalk: Chalk) {
        super(chalk);
    }

    heading(...parts: any[]): string {
        return this.chalk.bold.white(this.joined(parts));
    }

    separator(pattern: string): string {
        return this.chalk.yellow(this.repeat(pattern));
    }

    log(...parts): string {
        return this.chalk.yellow(this.joined(parts));
    }
}
