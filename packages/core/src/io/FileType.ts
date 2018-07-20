import { TinyType, TinyTypeOf } from 'tiny-types';
import { FileExtension } from './FileExtension';
import { MimeType } from './MimeType';

export class FileType extends TinyType {
    static JSON = new FileType(FileExtension.JSON, MimeType.Application_JSON);
    static PNG = new FileType(FileExtension.PNG, MimeType.Image_PNG);

    constructor(
        public readonly extesion: FileExtension,
        public readonly mimeType: MimeType,
    ) {
        super();
    }
}
