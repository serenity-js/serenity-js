import { Serialised, TinyType, TinyTypeOf } from 'tiny-types';
import { FileExtension } from './FileExtension';
import { MimeType } from './MimeType';

export class FileType extends TinyType {
    static JSON = new FileType(FileExtension.JSON, MimeType.Application_JSON);
    static PNG = new FileType(FileExtension.PNG, MimeType.Image_PNG);

    static fromJSON = (o: Serialised<FileType>) => new FileType(
        FileExtension.fromJSON(o.extesion as string),
        MimeType.fromJSON(o.mimeType as string),
    )

    constructor(
        public readonly extesion: FileExtension,
        public readonly mimeType: MimeType,
    ) {
        super();
    }
}
