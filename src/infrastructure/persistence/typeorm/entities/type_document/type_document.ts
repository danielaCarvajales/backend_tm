import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "../document/document";

@Entity('types_document', { schema: 'public' })
export class TypeDocument {

    @PrimaryGeneratedColumn({ type: "integer", name: "id_type_document" })
    public idTypeDocument: number;

    @Column({ type: "varchar", name: "name", length: 250, nullable: false })
    public nameTypeDocument: string;


    @OneToMany(() => Document, (document) => document.typeDocuments)
    public documents?: Document[];

    constructor(idTypeDocument: number, nameTypeDocument: string) {
        this.idTypeDocument = idTypeDocument;
        this.nameTypeDocument = nameTypeDocument;
    }
}
