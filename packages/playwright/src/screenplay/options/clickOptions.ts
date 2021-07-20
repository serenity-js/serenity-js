interface CommonClickOptions extends BasicOptions {
    delay?: number;
    force?: boolean;
    modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
    noWaitAfter?: boolean;
    position?: {
        x: number;
        y: number;
    };
    trial?: boolean;
}

export interface DoubleClickOptions extends CommonClickOptions {
    button?: 'left' | 'right' | 'middle';
}

export interface RightClickOptions extends CommonClickOptions {
    clickCount?: number;
}

export interface ClickOptions extends RightClickOptions, DoubleClickOptions {}
