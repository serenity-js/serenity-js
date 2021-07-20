export interface HoverOptions extends BasicOptions {
    force?: boolean;
    modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
    position?: {
        x: number;
        y: number;
    };
    trial?: boolean;
}
