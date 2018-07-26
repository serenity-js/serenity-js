import { TinyType, TinyTypeOf } from 'tiny-types';

export class FileExtension extends TinyTypeOf<string>() {
    static JSON = new FileExtension('json');
    static PNG = new FileExtension('png');
    static fromJSON = (v: string) => new FileExtension(v);
}
