import { TinyType, TinyTypeOf } from 'tiny-types';

export class MimeType extends TinyTypeOf<string>() {
    public static Application_JSON = new MimeType('application/json');
    public static Image_PNG = new MimeType('image/png');
}
