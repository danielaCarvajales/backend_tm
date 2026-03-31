import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PersonDocuments } from "../person-documents/person-documents";
import { TypeDocument } from "../type_document/type_document";
import { CaseDocument } from "../case-document/case-document";
import { Payment } from "../payment/payment";

@Entity('documents', { schema: 'public' })
export class Document {
    @PrimaryGeneratedColumn({ type: "integer", name: "id_document" })
    public idDocument: number;

    @Column({ type: "varchar", name: "name_file", length: 250, nullable: false })
    public nameFileDocument: string;

    @Column({ type: "varchar", name: "description", length: 250, nullable: true })
    public descriptionDocument: string | null;

    @Column({ type: "varchar", name: "url", length: 250, nullable: false })
    public urlDocument: string;

    @Column({ type: "varchar", name: "type", length: 250, nullable: false })
    public mimeType: string;

    @Column({ type: "timestamp", name: "created_at", nullable: false })
    public createdAtDocument: Date;

    @Column({ type: "integer", name: "id_type_document", nullable: true })
    public idTypeDocument: number | null;

    @ManyToOne(() => TypeDocument, (typeDocument) => typeDocument.documents, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",

    })
    @JoinColumn([{ name: "id_type_document" }])
    public documentType?: TypeDocument;

    @OneToMany(() => PersonDocuments, (personDocuments) => personDocuments.document)
    public personDocuments?: PersonDocuments[];

    @OneToMany(() => CaseDocument, (caseDocument) => caseDocument.document)
    public caseDocuments?: CaseDocument[];

    @OneToMany(() => Payment, (payment) => payment.supportDocument)
    public payments?: Payment[];
}
