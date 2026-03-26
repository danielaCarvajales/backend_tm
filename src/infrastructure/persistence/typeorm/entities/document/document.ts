import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PersonDocuments } from "../person-documents/person-documents";
import { TypeDocument } from "../type_document/type_document";
import { CaseDocument } from "../case-document/case-document";

@Entity('documents', { schema: 'public' })
export class Document {
    @PrimaryGeneratedColumn({ type: "integer", name: "id_document" })
    public idDocument: number;

    @Column({ type: "varchar", name: "name_file", length: 250, nullable: false })
    public nameFileDocument: string;

    @Column({ type: "varchar", name: "description", length: 250, nullable: false })
    public descriptionDocument: string;

    @Column({ type: "varchar", name: "url", length: 250, nullable: false })
    public urlDocument: string;

    @Column({ type: "varchar", name: "type", length: 250, nullable: false })
    public typeDocument: string;

    @Column({ type: "timestamp", name: "created_at", nullable: false })
    public createdAtDocument: Date;

    @ManyToOne(() => TypeDocument, (typeDocument) => typeDocument.documents, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",

    })
    @JoinColumn([{ name: "id_document" }])
    public typeDocuments?: TypeDocument;

    @OneToMany(() => PersonDocuments, (personDocuments) => personDocuments.document)
    public personDocuments?: PersonDocuments[];

    @OneToMany(() => CaseDocument, (caseDocument) => caseDocument.document)
    public caseDocuments?: CaseDocument[];


    constructor(idDocument: number, nameFileDocument: string, descriptionDocument: string, urlDocument: string, typeDocument: string, createdAtDocument: Date) {
        this.idDocument = idDocument;
        this.nameFileDocument = nameFileDocument;
        this.descriptionDocument = descriptionDocument;
        this.urlDocument = urlDocument;
        this.typeDocument = typeDocument;
        this.createdAtDocument = createdAtDocument;
    }
}
