/**
 * @desc
 *  Represents pressable keys that aren't text to be used with {@link Press}.
 *
 *  Note that modifier like Shift, Alt and Meta (a.k.a. Command on Mac) will stay pressed
 *
 * @enum {string}
 * @see {@link Press}
 * @see https://w3c.github.io/webdriver/webdriver-spec.html#keyboard-actions
 * @see https://github.com/puppeteer/puppeteer/blob/v7.1.0/src/common/USKeyboardLayout.ts
 * @see https://github.com/SeleniumHQ/selenium/blob/trunk/javascript/node/selenium-webdriver/lib/input.js#L46
 * @see https://github.com/webdriverio/webdriverio/blob/main/packages/wdio-utils/src/constants.ts#L5
 */
export class Key {
    public static Alt = new Key('Alt', '\uE00A', true);
    public static ArrowDown = new Key('ArrowDown', '\uE015');
    public static ArrowLeft = new Key('ArrowLeft', '\uE012');
    public static ArrowRight = new Key('ArrowRight', '\uE014');
    public static ArrowUp = new Key('ArrowUp', '\uE013');
    public static Backspace = new Key('Backspace', '\uE003');
    public static Cancel = new Key('Cancel', '\uE001');
    public static Clear = new Key('Clear', '\uE005');
    public static Control = new Key('Control', '\uE009', true);
    public static Delete = new Key('Delete', '\uE017');
    public static End = new Key('End', '\uE010');
    public static Enter = new Key('Enter', '\uE007');
    public static Escape = new Key('Escape', '\uE00C');
    public static F1 = new Key('F1', '\uE031');
    public static F2 = new Key('F2', '\uE032');
    public static F3 = new Key('F3', '\uE033');
    public static F4 = new Key('F4', '\uE034');
    public static F5 = new Key('F5', '\uE035');
    public static F6 = new Key('F6', '\uE036');
    public static F7 = new Key('F7', '\uE037');
    public static F8 = new Key('F8', '\uE038');
    public static F9 = new Key('F9', '\uE039');
    public static F10 = new Key('F10', '\uE03A');
    public static F11 = new Key('F11', '\uE03B');
    public static F12 = new Key('F12', '\uE03C');
    public static Help = new Key('Help', '\uE002');
    public static Home = new Key('Home', '\uE011');
    public static Insert = new Key('Insert', '\uE016');
    public static Meta = new Key('Meta', '\uE03D', true);
    public static Numpad0 = new Key('Numpad0', '\uE01A');
    public static Numpad1 = new Key('Numpad1', '\uE01B');
    public static Numpad2 = new Key('Numpad2', '\uE01C');
    public static Numpad3 = new Key('Numpad3', '\uE01D');
    public static Numpad4 = new Key('Numpad4', '\uE01E');
    public static Numpad5 = new Key('Numpad5', '\uE01F');
    public static Numpad6 = new Key('Numpad6', '\uE020');
    public static Numpad7 = new Key('Numpad7', '\uE021');
    public static Numpad8 = new Key('Numpad8', '\uE022');
    public static Numpad9 = new Key('Numpad9', '\uE023');
    public static NumpadAdd = new Key('NumpadAdd', '\uE025');
    public static NumpadDecimal = new Key('NumpadDecimal', '\uE028');
    public static NumpadDivide = new Key('NumpadDivide', '\uE029');
    public static NumpadEqual = new Key('NumpadEqual', '\uE019');
    public static NumpadMultiply = new Key('NumpadMultiply', '\uE024');
    public static NumpadSubtract = new Key('NumpadSubtract', '\uE027');
    public static PageDown = new Key('PageDown', '\uE00F');
    public static PageUp = new Key('PageUp', '\uE00E');
    public static Pause = new Key('Pause', '\uE00B');
    public static Semicolon = new Key('Semicolon', '\uE018');
    public static Shift = new Key('Shift', '\uE008', true);
    public static Space = new Key('Space', '\uE00D');
    public static Tab = new Key('Tab', '\uE004');

    public static isKey(maybeKey: unknown): maybeKey is Key {
        return !! maybeKey
            && maybeKey instanceof Key;
    }

    constructor(
        public readonly devtoolsName: string,
        public readonly utf16codePoint: string,
        public readonly isModifier: boolean = false,
    ) {
    }

    toString(): string {
        return this.devtoolsName;
    }
}
