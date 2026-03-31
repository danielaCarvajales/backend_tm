import { TypeDocument } from './type-document.entity';

export class Document {
  constructor(
    public readonly idDocument: number | undefined,
    public readonly nameFileDocument: string,
    public readonly descriptionDocument: string | null,
    public readonly urlDocument: string,
    public readonly mimeType: string,
    public readonly idTypeDocument: number | null,
    public readonly createdAtDocument: Date,
    public readonly typeDocument: TypeDocument | null = null,
  ) {}
}
